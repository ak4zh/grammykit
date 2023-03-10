import { dev } from '$app/environment';
import * as env from '$env/static/private';
import { json, type RequestHandler, error } from '@sveltejs/kit';
import { Bot, webhookCallback } from 'grammy';

const bot = new Bot(env.BOT_TOKEN)
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

export const POST: RequestHandler = webhookCallback(bot, 'sveltekit')

export const GET: RequestHandler = async ({ url, params }) => {
    if (params.token !== env.BOT_TOKEN) {
        throw error(401, 'Unauthorized')
    };
    const baseURL = dev ? env.HTTPS_LOCALHOST : url.origin
    return json(await bot.api.setWebhook(`${baseURL}${url.pathname}`))
}