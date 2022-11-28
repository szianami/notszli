import type { Timestamp } from 'firebase/firestore';

interface User {
    username: string;
    profilePicUrl: string;
}

type ReactionType = 'like' | 'comment';

interface Reaction {
    type: ReactionType;
    uid: string;
    documentId: string;
    text?: string;
    time: Timestamp;
}

type ReactionCount = {
    [type in ReactionType]: number;
};

interface Document {
    authorId: string;
    title: string;
    description?: string;
    reactionCount: ReactionCount; // pl. első 10-et szeretném megjeleníteni, nem feltétlen az összeset
}

interface Block {
    documentId: string;
    index: number;
    className: string;
    text: string;
}