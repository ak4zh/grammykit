import { dev } from '$app/environment';
import * as env from '$env/static/private';
import { json, type RequestHandler } from '@sveltejs/kit';
import { Bot, webhookCallback } from 'grammy';

const bot = new Bot(env.BOT_TOKEN)

bot.on('message:entities:bot_command', async (ctx, next) => {
    await ctx.reply(`You sent bot command: ${ctx.msg.text}`, {
        reply_to_message_id: ctx.msg?.message_id
    });
    // I want all handlers to run if they match `bot.on`
    await next();
})

bot.command('start', async (ctx, next) => {
    await ctx.reply('Welcome to grammykit !', {
        reply_to_message_id: ctx.msg?.message_id
    });
    await next();
})

bot.command('help', async (ctx, next) => {
    await ctx.reply('Help info !', {
        reply_to_message_id: ctx.msg?.message_id
    });
    await next();
})

bot.filter(() => true, (ctx) => console.log(ctx.msg?.message_id))

export const POST: RequestHandler = webhookCallback(bot, 'sveltekit')

export const GET: RequestHandler = async ({ url }) => {
    const webhookUrl = dev ? `${env.HTTPS_LOCALHOST}/${env.BOT_TOKEN}` : `${url.origin}/${env.BOT_TOKEN}`
    return json(await bot.api.setWebhook(webhookUrl))
}