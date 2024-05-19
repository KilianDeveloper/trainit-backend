import { Column, Entity, PrimaryColumn } from "typeorm"
import { dateTransformer } from "../utils/dateTransformer"
import { BaseEntity } from "./BaseEntity"
import { FriendshipStatus } from "./FriendshipStatus"

@Entity("friendship")
export class Friendship implements BaseEntity {
    @PrimaryColumn({ name: "account_id_1" })
    accountId1: string

    @PrimaryColumn({ name: "account_id_2" })
    accountId2: string

    @Column({
        name: "1_follows_2",
        type: "varchar",
        generated: false,
        nullable: true,
        transformer: dateTransformer,
    })
    account1FollowsAccount2: Date | null

    @Column({
        name: "1_follows_2_accepted",
        })
    account1FollowsAccount2Accepted: boolean

    @Column({
        name: "2_follows_1_accepted",
        })
    account2FollowsAccount1Accepted: boolean

    @Column({
        name: "2_follows_1",
        type: "varchar",
        generated: false,
        nullable: true,
        transformer: dateTransformer,
    })
    account2FollowsAccount1: Date | null

    public toAccountJson(accountId: string): any {
        if (this.accountId1 === accountId) {
            return {
                accountId: this.accountId1,
                followingSince: this.account1FollowsAccount2,
                followsYouSince: this.account2FollowsAccount1,
            }
        } else if (this.accountId1 === accountId) {
            return {
                accountId: this.accountId1,
                followingSince: this.account2FollowsAccount1,
                followsYouSince: this.account2FollowsAccount1,
            }
        } else {
            return this;
        }
    }

    public getFriendshipState(accountId: string): any {
        if (this.accountId1 === accountId) {
            const isFollower = this.account1FollowsAccount2 !== null && this.account2FollowsAccount1Accepted === true;
            const isFollowed = this.account2FollowsAccount1 !== null && this.account2FollowsAccount1Accepted === true;
            if(isFollower === true && isFollowed === true){
                return FriendshipStatus.FULL;
            }else if(this.account1FollowsAccount2 !== null && this.account2FollowsAccount1Accepted === false){
                return FriendshipStatus.REQUESTED;
            } else if(this.account2FollowsAccount1 !== null && this.account2FollowsAccount1Accepted === false){
                return FriendshipStatus.REQUESTEDME;
            } else{
                return FriendshipStatus.NONE;
            }
        } else if (this.accountId1 === accountId) {
            const isFollowed = this.account1FollowsAccount2 !== null && this.account2FollowsAccount1Accepted === true;
            const isFollower = this.account2FollowsAccount1 !== null && this.account2FollowsAccount1Accepted === true;
            if(isFollower === true && isFollowed === true){
                return FriendshipStatus.FULL;
            }else if(this.account1FollowsAccount2 !== null && this.account2FollowsAccount1Accepted === false){
                return FriendshipStatus.REQUESTEDME;
            } else if(this.account2FollowsAccount1 !== null && this.account2FollowsAccount1Accepted === false){
                return FriendshipStatus.REQUESTED;
            } else{
                return FriendshipStatus.NONE;
            }
        } else {
            return FriendshipStatus.NONE;
        }
    }

    public hashableString() {
        return this.accountId1 + this.accountId2 + (this.account1FollowsAccount2 ?? "").toString() + (this.account2FollowsAccount1 ?? "").toString()
    }

    public static newEntityForFollowing(followerId: string, followingId: string, isFollowingProfilePublic: boolean): Friendship {
        const friendship = new Friendship();
        friendship.accountId1 = followerId;
        friendship.accountId2 = followingId;
        friendship.account1FollowsAccount2 = new Date();
        friendship.account2FollowsAccount1 = null;
        friendship.account1FollowsAccount2Accepted = isFollowingProfilePublic;
        friendship.account2FollowsAccount1Accepted = false;
        return friendship;
    }
}