import { dev } from '$app/environment';
import * as env from '$env/static/private';
import { json, type RequestHandler } from '@sveltejs/kit';
import { Bot, webhookCallback } from 'grammy';

const BOT_COMMANDS = {
    start: 'Welcome to grammykit !',
    help: 'This is help info'
}

const buildBot = async (token: string) => {
    const bot = new Bot(token)
    const privateChats = bot.chatType('private')
    privateChats.on('message:entities:bot_command', async (ctx, next) => {
        await ctx.reply(`You sent bot command: ${ctx.msg.text}`, {
            reply_to_message_id: ctx.msg?.message_id
        });
        // I want all handlers to run if they match `bot.on`
        await next();
    })

    for (const [command, msg] of Object.entries(BOT_COMMANDS)) {
        privateChats.command(command, async (ctx, next) => {
            await ctx.reply(msg, {
                reply_to_message_id: ctx.msg?.message_id
            });
            // so something else
            await ctx.reply(msg);
            await ctx.forwardMessage(ctx.senderChat?.id)
            await next();
        })    
    }

    return bot
}

export const POST: RequestHandler = async (event) => {
	const bot = await buildBot(event.params.token);
	return webhookCallback(bot, 'sveltekit')(event);
}

export const GET: RequestHandler = async ({ url, params }) => {
    const baseURL = dev ? env.HTTPS_LOCALHOST : url.origin
    const bot = new Bot(params.token)
    return json(await bot.api.setWebhook(`${baseURL}${url.pathname}`))
}