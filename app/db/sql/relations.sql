
ALTER TABLE "user"
ADD CONSTRAINT fk_unique_user
UNIQUE (email);


ALTER TABLE "creds"
ADD CONSTRAINT fk_creds_user
FOREIGN KEY (user_id) REFERENCES "user"(id);

ALTER TABLE "todos"
ADD CONSTRAINT fk_todos_user
FOREIGN KEY (user_id) REFERENCES "user"(id);