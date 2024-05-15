import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";
import dotenv from 'dotenv';


dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt((process.env.DB_PORT)as string),
  database: "postgres",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.query("CREATE DATABASE todo;").then(
  (result) => {
    const db_todo = new Pool({
      host: process.env.DB_HOST,
      port: parseInt((process.env.DB_PORT)as string),
      database: process.env.DB,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    db_todo
      .query(readFileSync(join(__dirname, "sql/tables.sql")).toString())
      .then(
        (result) => {
          db_todo
            .query(
              readFileSync(join(__dirname, "sql/relations.sql")).toString()
            )
            .then(
              (result) => {
                console.log("successfully created the database");
                pool.end().then((result) => {
                  db_todo.end().then((result) => {
                    console.log("ended the database connection");
                  });
                });
              },
              (err) => {
                console.error("Error creating relations:", err.message);
                pool.end().then((result) => {
                  db_todo.end().then((result) => {
                    console.log("ended the database connection");
                  });
                });
              }
            );
        },
        (err) => {
          console.error("Error creating tables:", err.message);
          pool.end().then((result) => {
            db_todo.end().then((result) => {
              console.log("ended the database connection");
            });
          });
        }
      );
  },
  (err) => {
    console.error("Error creating database:", err.message);
    pool.end().then((result) => {
      console.log("ended the database connection");
    });
  }
);
