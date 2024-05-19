import { Friendship } from "../Friendship";

export class GetAccountFriendship {
    friendId: string
    username: string

    followingSince: Date | null
    followingAccepted: boolean
    friendIsFollowerSince: Date | null
    friendIsFollowerAccepted: boolean

    public hashableString() {
        return this.friendId + (this.followingSince ?? "").toString() + (this.friendIsFollowerSince ?? "").toString()
    }

    public static async fromFriendship(friendship: Friendship, currentAccountId: string, loadUsername : (id: string) => Promise<string | undefined>): Promise<GetAccountFriendship> {
        const data = new GetAccountFriendship();
        const isCurrentAccountAccount1 = friendship.accountId1 === currentAccountId;
        const isCurrentAccountAccount2 = friendship.accountId2 === currentAccountId;
        if (!isCurrentAccountAccount1 && !isCurrentAccountAccount2 || isCurrentAccountAccount1 && isCurrentAccountAccount2) {
            throw Error("wrong data");
        }
        if(isCurrentAccountAccount1){
            const username = await loadUsername(friendship.accountId2)
            data.friendId = friendship.accountId2;
            data.username = username ? username : "";
            data.friendIsFollowerSince = friendship.account2FollowsAccount1;
            data.followingSince = friendship.account1FollowsAccount2;
            data.followingAccepted = friendship.account1FollowsAccount2Accepted;
            data.friendIsFollowerAccepted = friendship.account2FollowsAccount1Accepted;
        }else{
            const username = await loadUsername(friendship.accountId1)

            data.friendId = friendship.accountId1;
            data.username = username ? username : "";
            data.friendIsFollowerSince = friendship.account1FollowsAccount2;
            data.followingSince = friendship.account2FollowsAccount1;
            data.followingAccepted = friendship.account2FollowsAccount1Accepted;
            data.friendIsFollowerAccepted = friendship.account1FollowsAccount2Accepted;
        }
        return data;
    }
}