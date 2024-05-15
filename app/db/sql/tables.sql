CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION generate_ulid() RETURNS uuid AS $$
SELECT (
        lpad(
            to_hex(
                floor(
                    extract(
                        epoch
                        FROM clock_timestamp()
                    ) * 1000
                )::bigint
            ),
            12,
            '0'
        ) || encode(gen_random_bytes(10), 'hex')
    )::uuid;
$$ LANGUAGE SQL;

CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY DEFAULT generate_ulid(),
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "creds" (
    user_id TEXT PRIMARY KEY,
    password_hash TEXT,
    refresh_token TEXT,
    is_verified boolean,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "todos" (
    id TEXT PRIMARY KEY DEFAULT generate_ulid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    todo TEXT NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);