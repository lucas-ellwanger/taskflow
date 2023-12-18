import type { Card, List } from "@/server/db/schema";

export type ListWithCards = List & { cards: Card[] };

export type CardWithList = Card & { list: List };
