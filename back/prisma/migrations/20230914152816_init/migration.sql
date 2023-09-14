-- CreateEnum
CREATE TYPE "channel_role" AS ENUM ('owner', 'admin', 'defaultUser', 'invited', 'banned');

-- CreateEnum
CREATE TYPE "channel_type" AS ENUM ('direct', 'protected', 'private', 'public');

-- CreateEnum
CREATE TYPE "relation_type" AS ENUM ('friends', 'invite', 'blocked');

-- CreateTable
CREATE TABLE "Relationship" (
    "id" INTEGER NOT NULL,
    "senderID" INTEGER,
    "receiverID" INTEGER,
    "type" "relation_type",

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "type" "channel_type",
    "created_at" TIMESTAMP(6),

    CONSTRAINT "channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channelConnection" (
    "id" INTEGER NOT NULL,
    "userId" INTEGER,
    "channelId" INTEGER,
    "role" "channel_role",
    "muted" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),

    CONSTRAINT "channelConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" INTEGER NOT NULL,
    "userID" INTEGER,
    "body" TEXT,
    "created_at" TIMESTAMP(6),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "games" TEXT NOT NULL,
    "twoFA" BOOLEAN NOT NULL DEFAULT false,
    "totpKey" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_receiverID_fkey" FOREIGN KEY ("receiverID") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "channelConnection" ADD CONSTRAINT "channelConnection_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "channelConnection" ADD CONSTRAINT "channelConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_id_fkey1" FOREIGN KEY ("id") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
