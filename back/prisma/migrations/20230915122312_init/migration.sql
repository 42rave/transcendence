-- CreateEnum
CREATE TYPE "ChannelRole" AS ENUM ('OWNER', 'ADMIN', 'DEFAULT', 'INVITED', 'BANNED');

-- CreateEnum
CREATE TYPE "ChannelKind" AS ENUM ('DIRECT', 'PROTECTED', 'PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "RelationKind" AS ENUM ('FRIENDS', 'INVITE', 'BLOCKED');

-- CreateTable
CREATE TABLE "Relationship" (
    "id" SERIAL NOT NULL,
    "senderID" INTEGER,
    "receiverID" INTEGER,
    "kind" "RelationKind",

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "kind" "ChannelKind",
    "created_at" TIMESTAMP(6),

    CONSTRAINT "channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channelConnection" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "channelId" INTEGER,
    "role" "ChannelRole",
    "muted" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),

    CONSTRAINT "channelConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
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
    "twoFAEnabled" BOOLEAN NOT NULL DEFAULT false,
    "totpKey" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

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
