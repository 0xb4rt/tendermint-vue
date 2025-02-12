import { Order } from '../codec/ibc/core/channel/v1/channel';
import { Height } from '../codec/ibc/core/client/v1/client';
import { AckWithMetadata, Endpoint, PacketWithMetadata, QueryOpts } from './endpoint';
import { ChannelInfo, IbcClient } from './ibcclient';
import { Logger } from './logger';
/**
 * Many actions on link focus on a src and a dest. Rather than add two functions,
 * we have `Side` to select if we initialize from A or B.
 */
export declare type Side = 'A' | 'B';
export declare function otherSide(side: Side): Side;
export interface RelayedHeights {
    packetHeightA?: number;
    packetHeightB?: number;
    ackHeightA?: number;
    ackHeightB?: number;
}
/**
 * Link represents a Connection between a pair of blockchains (Nodes).
 * An initialized Link requires a both sides to have a Client for the remote side
 * as well as an established Connection using those Clients. Channels can be added
 * and removed to a Link. There are constructors to find/create the basic requirements
 * if you don't know the client/connection IDs a priori.
 */
export declare class Link {
    readonly endA: Endpoint;
    readonly endB: Endpoint;
    readonly logger: Logger;
    private readonly chainA;
    private readonly chainB;
    private chain;
    private otherChain;
    /**
     * findConnection attempts to reuse an existing Client/Connection.
     * If none exists, then it returns an error.
     *
     * @param nodeA
     * @param nodeB
     */
    static createWithExistingConnections(nodeA: IbcClient, nodeB: IbcClient, connA: string, connB: string, logger?: Logger): Promise<Link>;
    /**
     * we do this assert inside createWithExistingConnections, but it could be a useful check
     * for submitting double-sign evidence later
     *
     * @param proofSide the side holding the consensus proof, we check the header from the other side
     * @param height the height of the consensus state and header we wish to compare
     */
    assertHeadersMatchConsensusState(proofSide: Side, clientId: string, height?: Height): Promise<void>;
    /**
     * createConnection will always create a new pair of clients and a Connection between the
     * two sides
     *
     * @param nodeA
     * @param nodeB
     */
    static createWithNewConnections(nodeA: IbcClient, nodeB: IbcClient, logger?: Logger, trustPeriodA?: number, trustPeriodB?: number): Promise<Link>;
    constructor(endA: Endpoint, endB: Endpoint, logger?: Logger);
    /**
     * Writes the latest header from the sender chain to the other endpoint
     *
     * @param sender Which side we get the header/commit from
     * @returns header height (from sender) that is now known on dest
     *
     * Relayer binary should call this from a heartbeat which checks if needed and updates.
     * Just needs trusting period on both side
     */
    updateClient(sender: Side): Promise<Height>;
    /**
     * Checks if the last proven header on the destination is older than maxAge,
     * and if so, update the client. Returns the new client height if updated,
     * or null if no update needed
     *
     * @param sender
     * @param maxAge
     */
    updateClientIfStale(sender: Side, maxAge: number): Promise<Height | null>;
    /**
     * Ensures the dest has a proof of at least minHeight from source.
     * Will not execute any tx if not needed.
     * Will wait a block if needed until the header is available.
     *
     * Returns the latest header height now available on dest
     */
    updateClientToHeight(source: Side, minHeight: number): Promise<Height>;
    createChannel(sender: Side, srcPort: string, destPort: string, ordering: Order, version: string): Promise<ChannelPair>;
    /**
     * This will check both sides for pending packets and relay them.
     * It will then relay all acks (previous and generated by the just-submitted packets).
     * If pending packets have timed out, it will submit a timeout instead of attempting to relay them.
     *
     * Returns the most recent heights it relay, which can be used as a start for the next round
     */
    checkAndRelayPacketsAndAcks(relayFrom: RelayedHeights, timedoutThresholdBlocks?: number, timedoutThresholdSeconds?: number): Promise<RelayedHeights>;
    getPendingPackets(source: Side, opts?: QueryOpts): Promise<PacketWithMetadata[]>;
    getPendingAcks(source: Side, opts?: QueryOpts): Promise<AckWithMetadata[]>;
    private filterUnreceived;
    lastKnownHeader(side: Side): Promise<number>;
    relayPackets(source: Side, packets: readonly PacketWithMetadata[]): Promise<AckWithMetadata[]>;
    relayAcks(source: Side, acks: readonly AckWithMetadata[]): Promise<number | null>;
    timeoutPackets(source: Side, packets: readonly PacketWithMetadata[]): Promise<number | null>;
    private getEnds;
}
export interface EndpointPair {
    readonly src: Endpoint;
    readonly dest: Endpoint;
}
export interface ChannelPair {
    readonly src: ChannelInfo;
    readonly dest: ChannelInfo;
}
