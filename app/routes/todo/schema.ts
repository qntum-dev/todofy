import { Static, Type } from "@sinclair/typebox";

export const TodoSchema=Type.String();


export const TodoBodySchema=Type.Object({
    todo:TodoSchema
});

export type Todo=Static<typeof TodoSchema>;

