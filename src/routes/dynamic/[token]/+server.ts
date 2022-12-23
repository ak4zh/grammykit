import { dev } from '$app/environment';
import * as env from '$env/static/private';
import { json, type RequestHandler } from '@sveltejs/kit';
import { Bot, webhookCallback } from 'grammy';


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

    privateChats.command('start', async (ctx, next) => {
        await ctx.reply('Welcome to grammykit !', {
            reply_to_message_id: ctx.msg?.message_id
        });
        await next();
    })

    privateChats.command('help', async (ctx, next) => {
        await ctx.reply('Help info !', {
            reply_to_message_id: ctx.msg?.message_id
        });
        await next();
    })
    return bot
}

export const POST: RequestHandler = async (event) => {
	const bot = await buildBot(event.params.token);
	return webhookCallback(bot, 'sveltekit')(event);
}

export const GET: RequestHandler = async ({ url, params }) => {
    const webhookUrl = dev ? `${env.HTTPS_LOCALHOST}/${params.token}` : `${url.origin}/${params.token}`
    const bot = new Bot(params.token)
    return json(await bot.api.setWebhook(webhookUrl))
}