import { auth } from 'firebase-admin'
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'
import sharp from "sharp"
import { UpdateResult } from 'typeorm'
import { logger } from '../config/logging.config'
import { AppDataSource } from "../config/mysql.connector"
import { DATA_SOURCES } from '../config/vars.config'
import { Account } from "../models/Account"
import { BodyValue } from '../models/BodyValue'
import { CalendarTraining } from '../models/CalendarTraining'
import { Friendship } from '../models/Friendship'
import { FriendshipStatus } from '../models/FriendshipStatus'
import { Goal } from '../models/Goal'
import { GoalType } from '../models/GoalType'
import { MeasurementUnit, PersonalRecord, valueToUnit } from '../models/PersonalRecord'
import { TrainingInvitation } from '../models/TrainingInvitation'
import { TrainingPlan } from "../models/TrainingPlan"
import { User } from '../models/User'

import { GetAccountFriendship } from '../models/dto/GetAccountFriendship'
import { GetStatistics } from '../models/dto/GetStatistics'

const accountRepository = AppDataSource.getRepository(Account)
const friendshipRepository = AppDataSource.getRepository(Friendship)
const trainingInvitationRepository = AppDataSource.getRepository(TrainingInvitation)
const trainingPlanRepository = AppDataSource.getRepository(TrainingPlan)

export const loadAccount = async (id: string) => {
    return await accountRepository.findOneBy({ id })
}

export const loadUsername = async (id: string) => {
    return (await accountRepository.findOneBy({ id }))?.username;
}

const isFriendshipAcceptedForAccount = (friendship: Friendship, id: string): boolean => {
    const isFriend1 = friendship.accountId1 === id && friendship.account1FollowsAccount2 !== null && friendship.account1FollowsAccount2Accepted === true;
    const isFriend2 = friendship.accountId2 === id && friendship.account2FollowsAccount1 !== null && friendship.account2FollowsAccount1Accepted === true;
    return isFriend1 || isFriend2;
}

export const loadFriendships = async (id: string) => {
    return await friendshipRepository.find({
        where: [
            {
                accountId1: id,
            },
            {
                accountId2: id,
            }
        ]
    });
}

export const loadProfile = async (authenticatedId: string, searchedEmail: string | undefined, searchedId: string) => {
    let accountId = searchedId;
    if (accountId === "email") {
        if (searchedEmail !== undefined) {
            try {
                const user = await auth().getUserByEmail(searchedEmail.toLowerCase());
                accountId = user.uid
            } catch (ex: any) {
                return null;
            }
        } else {
            return null;
        }
    }
    const account = await loadAccount(accountId);
    const friends = await loadFriendships(accountId);
    const friendship = friends.filter((value) => isFriendshipAcceptedForAccount(value, authenticatedId));
    const mappedFriends = await Promise.all(friends.map(o => GetAccountFriendship.fromFriendship(o, accountId, async (id: string) => { return await loadUsername(id); })));
    const numOfFollowers = mappedFriends.filter((value) => value.friendIsFollowerAccepted === true && value.friendIsFollowerSince !== null).length;
    const numOfFollowing = mappedFriends.filter((value) => value.followingAccepted === true && value.followingSince !== null).length;

    if (account === null) {
        return null
    } else if (account.isPublicProfile === false && friendship.length > 0) {
        return {
            id: account.id,
            username: account.username,
            isPublicProfile: false,
            friendshipState: friendship[0].getFriendshipState(authenticatedId),
            numOfFollowers,
            numOfFollowing,
        }
    } else {
        let trainingPlan = await trainingPlanRepository.findOne({ where: { id: account?.trainingPlanId } });
        if (trainingPlan !== null) {
            trainingPlan = trainingPlan.toMobileVersion();
        }

        const authenticatedFriendship = mappedFriends.find(e => e.friendId === authenticatedId);
        let state = FriendshipStatus.NONE;
        if (authenticatedFriendship !== undefined) {
            if (authenticatedFriendship.followingSince !== null && authenticatedFriendship.friendIsFollowerSince !== null) {
                state = FriendshipStatus.FULL;
            } else if (authenticatedFriendship.followingSince !== null && authenticatedFriendship.friendIsFollowerSince == null) {
                state = FriendshipStatus.REQUESTEDME;
            } else if (authenticatedFriendship.followingSince == null && authenticatedFriendship.friendIsFollowerSince !== null) {
                state = FriendshipStatus.REQUESTED;
            }
        }

        return {
            id: account.id,
            username: account.username,
            personalRecords: account.personalRecords.filter(o => o.isFavorite),
            goals: account.goals.filter(o => !o.isDone),
            trainingPlan,
            isPublicProfile: account.isPublicProfile,
            friendshipState: state,
            numOfFollowers,
            numOfFollowing,
            friendships: await Promise.all(mappedFriends.map(async o => {
                const friend = await accountRepository.findOne({ where: { id: o.friendId }, select: { username: true, } });
                return {
                    id: o.friendId,
                    name: friend?.username,
                    following: o.followingSince !== null && o.followingAccepted === true,
                    isFriendFollower: o.friendIsFollowerSince !== null && o.friendIsFollowerAccepted === true
                }
            }))
        }
    }
}

export const createAccountForIdWithTrainingPlan = async (userId: string, username: string) => {
    const account = Account.newEntity(userId, username)
    const trainingPlan = TrainingPlan.newEntity(userId)

    account.trainingPlanId = trainingPlan.id

    const createPlanResult = await trainingPlanRepository.insert(trainingPlan)
    const createUserResult = await accountRepository.insert(account)

    if (createPlanResult.identifiers.length > 0 && createPlanResult.identifiers[0].id === trainingPlan.id
        && createUserResult.identifiers.length > 0 && createUserResult.identifiers[0].id === account.id) return { account, trainingPlan }
    else return null
}

export const updateAccount = async (account: Account) => {
    if (await trainingPlanRepository.findOneBy({ id: account.trainingPlanId }) !== null) {
        if (account.personalRecords == null || account.bodyFat == null || account.bodyWeight == null || account.goals == null) {
            const savedAccount = await accountRepository.findOneBy({ id: account.id })
            account.notifications = savedAccount?.notifications ?? [];
            if (account.personalRecords == null) {
                account.personalRecords = savedAccount?.personalRecords ?? []
            }
            account.bodyFat = savedAccount?.bodyFat ?? []
            account.bodyWeight = savedAccount?.bodyWeight ?? []
            if (account.goals == null) {
                account.goals = savedAccount?.goals ?? []
            }
        }
        account.personalRecords = account.personalRecords.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.name === value.name
            ))
        )
        const updateResult = await accountRepository.update({ id: account.id }, account)
        if ((updateResult).affected !== undefined && updateResult.affected !== 0)
            return account
    } else logger.error("Update Account: trainingPlan not found")
    return false
}

export const existsWithId = async (userId: string) => {
    return await accountRepository.findOneBy({ id: userId }) !== null
}

export const uploadFile = (buffer: Buffer, userId: string) => {
    const userPath = join(__dirname, "../../data/users/")
    const dictionaryPath = join(__dirname, "../../data/users/" + userId + "/")
    if (!existsSync(dictionaryPath)) {
        if (!existsSync(userPath)) {
            mkdirSync(userPath);
        }
        mkdirSync(dictionaryPath);
    }
    const path = join(__dirname, "../../data/users/" + userId + "/photo.webp")
    writeFileSync(path, buffer, { flag: 'w', })
    logger.info("Uploaded file: " + path)
    return true
}

export const deleteProfilePicture = (userId: string) => {
    const path = join(__dirname, "../../data/users/" + userId + "/photo.webp")
    unlinkSync(path)
    return true
}

export const updateStatistics = async (userId: string, personalRecords: PersonalRecord[] | null | undefined, goals: Goal[] | null | undefined,): Promise<boolean | number> => {
    const savedAccount = await accountRepository.findOneBy({ id: userId });

    if (savedAccount != null) {
        const pr = personalRecords ? personalRecords : savedAccount.personalRecords
        const g = goals ? goals : savedAccount.goals// TODO add field maxGoals, maxPRs for Account
        if (g.length > 1) {
            return 409;
        }

        const updateResult = await accountRepository.update({ id: userId }, { personalRecords: pr, lastModified: new Date(), goals: g, })
        if ((updateResult).affected !== undefined && updateResult.affected !== 0)
            return true
    } else logger.error("Update Statistics: account not found")
    return false
}

export const finishGoal = async (userId: string, goalId: string,) => {
    const savedAccount = await accountRepository.findOneBy({ id: userId });
    if (savedAccount == null) {
        return false;
    }

    const goal = savedAccount?.goals.find((value) => value.id === goalId)
    if (goal === undefined) {
        return false;
    }

    const isIncreasingGoal = goal.from < goal.to;

    let currentValue: number | null = null;
    if (goal.type === GoalType.BODYVALUE) {

        if (goal.name === "Body Fat") {
            if (savedAccount?.bodyFat.length === 0) return false;
            currentValue = valueToUnit(
                savedAccount.bodyFat[savedAccount.bodyFat.length - 1].value,
                MeasurementUnit.PERCENT,
                goal.unit,
            );
        } else if (goal.name === "Body Weight") {
            if (savedAccount?.bodyWeight.length === 0) return false;
            currentValue = valueToUnit(
                savedAccount.bodyWeight[savedAccount.bodyWeight.length - 1].value, MeasurementUnit.KILOGRAM, goal.unit);
        }
    } else if (goal.type === GoalType.PERSONALRECORD) {
        const personalRecord =
            savedAccount.personalRecords.find((element) => element.name === goal.name);
        if (personalRecord === undefined) return false;
        currentValue =
            valueToUnit(+personalRecord.value, goal.unit, personalRecord.unit);
    }
    if (currentValue == null) return false;
    const isGoalFinished = isIncreasingGoal ? currentValue >= goal.to : currentValue <= goal.to;
    if (isGoalFinished && !goal.isDone) {

        const newGoal = goal;
        newGoal.isDone = true;

        const newGoals = savedAccount?.goals.map((value) => value.id === goal.id ? newGoal : goal);
        const updateResult = await accountRepository.update({ id: userId }, { lastModified: new Date(), goals: newGoals, })
        if ((updateResult).affected !== undefined && updateResult.affected !== 0)
            return true
    }
    return false
}

export const generateGoalCard = async (userId: string, goalId: string, locale: string | undefined | null, callback: (err: Error, buffer: Buffer, info: sharp.OutputInfo) => void) => {
    const savedAccount = await accountRepository.findOneBy({ id: userId });
    if (savedAccount == null) {
        return false;
    }

    const goal = savedAccount?.goals.find((value) => value.id === goalId)
    if (goal === undefined) {
        return false;
    }
    let photoUrl = DATA_SOURCES.applicationDataSource.USER_URL + '/' + savedAccount.id + '/photo.webp'
    if (!existsSync(photoUrl)) {
        photoUrl = DATA_SOURCES.applicationDataSource.DATA_URL + '/base_profile_photo.png'
    }
    sharp(photoUrl)
        .png()
        .toBuffer((err, buffer) => {
            console.log(err)
            let data = readFileSync(DATA_SOURCES.applicationDataSource.DATA_URL + '/goal_card.svg', "utf-8");
            const deltaDates = (new Date()).getTime() - (new Date(goal.createdOn)).getTime()
            const duration = Math.round(deltaDates / (1000 * 60 * 60 * 24))
            data = data.replace("VALUE", goal.to.toFixed(2) + goal.unit.toString())
                .replace("DATE", (new Date()).toLocaleDateString(locale ?? "en-US"))
                .replace("GOALNAME", goal.name ?? "").replace("USERNAME", savedAccount.username)
                .replace("STARTVALUE", goal.from.toFixed(2) + goal.unit.toString())
                .replace("DURATION", duration.toFixed(0) + " days")
                .replace("SIGN", savedAccount.username)
                .replace("IMAGEDATA", buffer.toString('base64'))


            sharp(Buffer.from(data))
                .png()
                .toBuffer(callback);
        });
}

const hasBodyValueSameDate = (value: BodyValue, compareTo: BodyValue): boolean => {
    const date = new Date(value.date);
    return (date.getFullYear() === compareTo.date.getFullYear() &&
        date.getMonth() === compareTo.date.getMonth() &&
        date.getDate() === compareTo.date.getDate());
}

export const putBodyValues = async (userId: string, value: number, date: Date, type: string): Promise<number | boolean> => {
    const savedAccount = await accountRepository.findOneBy({ id: userId });
    const bodyValue = new BodyValue();
    bodyValue.date = new Date(date);

    const now = new Date()
    const dayDifference = Math.abs(now.getTime() - bodyValue.date.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDifference > 7) {
        return 422;
    }
    bodyValue.value = value;

    if (savedAccount != null) {
        if (type === "w") {
            if (savedAccount.bodyWeight.filter((v) => hasBodyValueSameDate(v, bodyValue)).length > 0) {
                return 409;
            }
            savedAccount.bodyWeight.push(bodyValue)
            savedAccount.bodyWeight = [...new Map(savedAccount.bodyWeight.map(v => [v.date, v])).values()];
        } else if (type === "f") {
            if (savedAccount.bodyFat.filter((v) => hasBodyValueSameDate(v, bodyValue)).length > 0) {
                return 409;
            }
            savedAccount.bodyFat.push(bodyValue)
            savedAccount.bodyFat = [...new Map(savedAccount.bodyFat.map(v => [v.date, v])).values()];
        }

        const updateResult = await accountRepository.update({ id: userId }, { bodyFat: savedAccount.bodyFat, bodyWeight: savedAccount.bodyWeight, lastModified: new Date(), })
        if ((updateResult).affected !== undefined && updateResult.affected !== 0)
            return true
    } else logger.error("Put BodyValues: account not found")
    return false
}

export const followUser = async (userId: string, followingId: string): Promise<number | GetAccountFriendship> => {
    const savedAccount = await accountRepository.findOneBy({ id: userId });
    const followingAccountExists = await accountRepository.exist({ where: { id: userId } });

    const now = new Date()
    if (savedAccount != null && followingAccountExists) {
        const followingAccount = await accountRepository.findOne({ where: { id: userId } });
        const friendships = await friendshipRepository.find({
            where: [
                {
                    accountId1: savedAccount?.id,
                    accountId2: followingId
                },
                {
                    accountId2: savedAccount?.id,
                    accountId1: followingId
                }
            ]
        });
        if (friendships.length > 1) {
            const deleteFriendship = friendships.pop();
            if (deleteFriendship) {
                await friendshipRepository.remove(deleteFriendship)
            }
        }

        const friendship = (friendships.length !== 0) ? friendships[0] : Friendship.newEntityForFollowing(savedAccount.id, followingId, followingAccount?.isPublicProfile || false)
        if (friendships.length > 0) {
            if (friendship.accountId1 === savedAccount.id && friendship.account1FollowsAccount2 === null) {
                friendship.account1FollowsAccount2 = now;
                if (friendship.account1FollowsAccount2Accepted === false && followingAccount?.isPublicProfile) {
                    friendship.account1FollowsAccount2Accepted = true;
                }
            } else if (friendship.accountId2 === savedAccount.id && friendship.account2FollowsAccount1 === null) {
                friendship.account2FollowsAccount1 = now;
                if (friendship.account2FollowsAccount1Accepted === false && followingAccount?.isPublicProfile) {
                    friendship.account2FollowsAccount1Accepted = true;
                }
            }// TODO add notification
            await friendshipRepository.save(friendship);
        } else {
            const result = await friendshipRepository.insert(friendship);
            if (result.identifiers.length === 0) {
                return 500;
            }
        }

        return GetAccountFriendship.fromFriendship(friendship, userId, loadUsername);
    } else if (!followingAccountExists) {
        return 404;
    } else logger.error("Put Friend: account not found")
    return 500
}

export const unfollowUser = async (userId: string, followingId: string): Promise<number | GetAccountFriendship | null> => {
    const savedAccount = await accountRepository.findOneBy({ id: userId });
    const followingAccountExists = await accountRepository.exist({ where: { id: userId } });

    if (savedAccount != null && followingAccountExists) {
        const friendships = await friendshipRepository.find({
            where: [
                {
                    accountId1: savedAccount?.id,
                    accountId2: followingId
                },
                {
                    accountId2: savedAccount?.id,
                    accountId1: followingId
                }
            ]
        });
        if (friendships.length > 1) {
            const deleteFriendship = friendships.pop();
            if (deleteFriendship) {
                await friendshipRepository.remove(deleteFriendship)
            }
        }

        if (friendships.length === 0) {
            return null;
        }

        const friendship = friendships[0]
        let updateResult: UpdateResult | null = null;
        if (friendship.accountId1 === savedAccount.id && friendship.account1FollowsAccount2 !== null) {
            if (friendship.account2FollowsAccount1 === null) {
                await friendshipRepository.remove(friendship);
            }
            updateResult = await friendshipRepository.update({ accountId1: savedAccount.id, accountId2: followingId }, { account1FollowsAccount2: null, account1FollowsAccount2Accepted: false, })
            friendship.account1FollowsAccount2 = null;
        } else if (friendship.accountId2 === savedAccount.id && friendship.account2FollowsAccount1 !== null) {
            if (friendship.account1FollowsAccount2 === null) {
                await friendshipRepository.remove(friendship);
            }
            updateResult = await friendshipRepository.update({ accountId2: savedAccount.id, accountId1: followingId, }, { account2FollowsAccount1: null, account2FollowsAccount1Accepted: false, })
            friendship.account2FollowsAccount1 = null;
        }
        if (updateResult === null) return GetAccountFriendship.fromFriendship(friendship, userId, loadUsername);
        if ((updateResult).affected !== undefined && updateResult.affected !== 0)
            return GetAccountFriendship.fromFriendship(friendship, userId, loadUsername);
    } else if (!followingAccountExists) {
        return 404;
    } else logger.error("Delete Friend: account not found")
    return 500;
}

export const acceptFollowRequest = async (userId: string, followingId: string): Promise<number | GetAccountFriendship | null> => {
    const savedAccount = await accountRepository.findOneBy({ id: userId });
    const followingAccountExists = await accountRepository.exist({ where: { id: userId } });

    if (savedAccount != null && followingAccountExists) {
        const friendships = await friendshipRepository.find({
            where: [
                {
                    accountId1: savedAccount?.id,
                    accountId2: followingId
                },
                {
                    accountId2: savedAccount?.id,
                    accountId1: followingId
                }
            ]
        });
        if (friendships.length === 0) {
            return null;
        }

        const friendship = friendships[0];
        let updateResult: UpdateResult | null = null;
        if (friendship.accountId1 === savedAccount.id && friendship.account1FollowsAccount2 !== null) {
            updateResult = await friendshipRepository.update({ accountId1: savedAccount.id, accountId2: followingId }, { account2FollowsAccount1Accepted: true })
            friendship.account2FollowsAccount1Accepted = true;
        } else if (friendship.accountId2 === savedAccount.id && friendship.account2FollowsAccount1 !== null) {
            updateResult = await friendshipRepository.update({ accountId2: savedAccount.id, accountId1: followingId, }, { account1FollowsAccount2Accepted: true, })
            friendship.account1FollowsAccount2Accepted = true;
        }
        if (updateResult === null) return GetAccountFriendship.fromFriendship(friendship, userId, loadUsername);
        if ((updateResult).affected !== undefined && updateResult.affected !== 0)
            return GetAccountFriendship.fromFriendship(friendship, userId, loadUsername);
    } else if (!followingAccountExists) {
        return 404;
    } else logger.error("Delete Friend: account not found")
    return 500;
}


export const loadBodyValues = async (userId: string, duration: number, account: Account | undefined): Promise<GetStatistics> => {
    const savedAccount = account ? account : await accountRepository.findOneBy({ id: userId });
    const maxDate = new Date()
    const minDate = new Date(maxDate.getTime() - (duration * 24 * 60 * 60 * 1000))

    const stats = new GetStatistics()
    if (savedAccount != null) {
        const sortedFat = savedAccount.bodyFat.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        const sortedWeight = savedAccount.bodyWeight.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        if (savedAccount.bodyFat.length !== 0) {
            stats.latestFat = sortedFat[0]
        }
        if (savedAccount.bodyWeight.length !== 0) {
            stats.latestWeight = sortedWeight[0]
        }

        const bodyFats = sortedFat.filter(e => {
            const date = new Date(e.date)
            return date >= minDate && date <= maxDate
        });
        const bodyWeights = sortedWeight.filter(e => {
            const date = new Date(e.date)
            return date >= minDate && date <= maxDate
        });
        stats.fat = bodyFats
        stats.weight = bodyWeights
        stats.success = true
        return stats
    } else logger.error("Put BodyValues: account not found")
    stats.success = false
    return stats
}


export const convertUserIdsToUsers = async (calendarTrainings: CalendarTraining[]) => {
    await Promise.all(calendarTrainings.map(async training => {
        let partners = await Promise.all(training.partners.map(async partner => {
            const a = await loadAccount(partner as string)
            if (a === null)
                return null
            else return new User(a)
        }))
        partners = partners.filter(partner => partner !== null)

        const t = training
        t.partners = partners as User[]

        return t
    }))
}

export const updateCalendar = async (userId: string, calendar: CalendarTraining[]) => {
    if (await existsWithId(userId)) {
        const account = await loadAccount(userId)
        const finalCalendar = calendar.map(training => {
            const newTraining = training
            const foundTraining = account?.calendarTrainings.filter(t => t.id === training.id)[0]
            if (foundTraining)
                newTraining.partners = foundTraining.partners
            else newTraining.partners = []
            return newTraining
        })
        const updateResult = await accountRepository.update({ id: userId }, { calendarTrainings: finalCalendar, lastModified: new Date() })
        if ((updateResult).affected !== undefined && updateResult.affected !== 0)
            return true
    } else logger.error("Update Calendars: account not found")
    return false
}

export const inviteAccountToCalendarTraining = async (accountId: string, calendarTrainingId: string, invitedAccountId: string): Promise<boolean | number> => {
    if (accountId === invitedAccountId)
        return 412

    const account = await loadAccount(accountId)
    const invitedAccount = await loadAccount(invitedAccountId)

    if (account != null && invitedAccount != null) {
        const trainings = account.calendarTrainings

        const training = trainings.find(t => t.id === calendarTrainingId)

        if (training) {
            const invitation = new TrainingInvitation()
            invitation.calendarTrainingId = calendarTrainingId
            invitation.invitedAccountId = invitedAccountId
            invitation.sendingAccountId = accountId
            invitation.createdOn = new Date()

            account.lastModified = new Date()
            invitedAccount.lastModified = new Date()

            await accountRepository.save([account, invitedAccount])

            await trainingInvitationRepository.save(invitation)

            return true
        } else logger.error("Invite User to Training: calendartraining not found")
    } else logger.error("Invite User to Training: one account not found")
    return 404
}

export const acceptCalendarTrainingInvitation = async (accountId: string, calendarTrainingId: string, sendingAccountId: string): Promise<CalendarTraining[] | number> => {
    const invitedAccount = await loadAccount(accountId)
    const sendingAccount = await loadAccount(sendingAccountId)

    if (sendingAccount != null && invitedAccount != null) {
        let training: CalendarTraining | undefined
        sendingAccount.calendarTrainings = sendingAccount.calendarTrainings.map(t => {
            if (t.id !== calendarTrainingId) return t
            else {
                const partners = (t.partners as string[])
                partners.push(accountId)
                const newTraining = t
                newTraining.partners = partners
                training = newTraining

                return newTraining
            }
        })

        if (training) {
            training.baseTrainingId = null
            training.partners = [sendingAccount.id]
            invitedAccount.calendarTrainings.push(training)
            invitedAccount.lastModified = new Date()
            sendingAccount.lastModified = new Date()

            await accountRepository.save([invitedAccount, sendingAccount])
            await trainingInvitationRepository.delete({ sendingAccountId, invitedAccountId: accountId, calendarTrainingId })
            return invitedAccount.calendarTrainings
        } else logger.error("Invite User to Training: calendartraining not found")
    } else logger.error("Invite User to Training: one account not found")
    return 404
}
