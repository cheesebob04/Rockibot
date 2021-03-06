const { Command } = require('discord.js-commando');
const path = require('path');
const mconfig = require(path.join(__dirname, 'mconfig.json'));
const Discord = require("discord.js");
const { Seller } = require("./models/Sellers");
const client1 = new Discord.Client();
// Requires Manager from discord-giveaways
const { GiveawaysManager } = require("discord-giveaways");
// Starts updating currents giveaways
const manager = new GiveawaysManager(client1, {
    storage: "./giveaways.json",
    updateCountdownEvery: 10000,
    default: {
        botsCanWin: false,
        embedColor: "#44ff00",
        embedColorEnd: "#d61818",
        reaction: "🎉"
    }
});
const ms = require("ms");
const Advertiser = require('./models/Advertiser.js');
// We now have a giveawaysManager property to access the manager everywhere!
client1.giveawaysManager = manager;

module.exports = class gstart extends Command {
    constructor(client) {
        super(client, {
            name: 'lookup',
            group: 'pizzatown',
            memberName: 'lookup',
            description: 'Looks up a PizzaTown users stats.',
            args: [
                {
                    key: 'name',
                    prompt: 'What is the account name of the user you want to look up?',
                    type:'string'
                }
            ],
			guildOnly: false,
        });
    }
    async run(message, {name}) {
        const formatSellers = sellerObjects => {
            let sellers = ''
            sellerObjects.forEach(seller => {
                sellers += `${seller.name} \n`
            })

            return "```" + sellers + "```"
        }
        Seller.findOne({ name }).then(user => {
            let uprofit = 0;
            user.menu.forEach(pizza => {
                let sales = 0;

                sales += pizza.production * 20

                sales -= pizza.cost * 5

                let profit = (sales * pizza.production / 2) / pizza.production;

                uprofit += Math.round(profit)
            })
            let profitmultiplier = 0;
            user.stores.forEach(store => {
                profitmultiplier += store.profitmultiplier
            })
            uprofit *= profitmultiplier
            const embed = new Discord.MessageEmbed()
                .setColor("#ccaaaa")
                .setTitle(`${user.name}'s stats (${client1.users.cache.get(user.discord_id).tag})`)
                .setAuthor(`${user.name}'s Stand.`, client1.users.cache.get(user.discord_id).displayAvatarURL({ format: "png", dynamic: true }))
                .addFields(
                    { name: "PizzaTokens", value: `${user.pizzaTokens}` },
                    { name: "Stores", value: "Check your stores with !stores" },
                    { name: "Menu", value: "Check your menu with !menu." },
                    { name: "Hourly Income", value: `${uprofit}` }
                )

            message.channel.send(embed)
        }).catch((err) => {
            Advertiser.findOne({ name }).then(user => {
                console.log(user)
                console.log(user.sellers)
                let uprofit = 0;
                uprofit += (user.sellers.length * 1000) + 500
                const embed = new Discord.MessageEmbed()
                    .setColor("#ccaaaa")
                    .setTitle(`${user.name}'s stats (${client1.users.cache.get(user.discord_id).tag})`)
                    .setAuthor(`${user.name}'s Stand.`, client1.users.cache.get(user.discord_id).displayAvatarURL({ format: "png", dynamic: true }))
                    .addFields(
                        { name: "PizzaTokens", value: `${user.pizzaTokens}` },
                        { name: "Sellers", value: formatSellers(user.sellers) },
                        { name: "Hourly Income", value: `${uprofit}` }
                    )
                message.channel.send(embed)
            }).catch((err) => {
                message.reply(`${name} does not exist!`)
            })
        })
    }
};


client1.login(require("../../config").token)