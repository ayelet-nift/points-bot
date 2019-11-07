var SlackBot = require('slackbots');

// create a bot
var bot = new SlackBot({
    token: 'xoxb-25508874064-816109600033-CrsnQMOSKob7VHVlyhWUqFRt', // Add a bot https://my.slack.com/services/new/bot and put the token
    name: 'points'
});

var players = {};

var bountyIndex = 0;
var openBounties = [];


// TODO: change the bot.postMessage to only post in the best team ever group
// add time so we can have the reviewer of the month

bot.on("message", msg => {
  switch (msg.type) {
      case "message":
        if (!players[msg.user]) {
            if (msg.text.indexOf('!newMate') === 0) {
                //add validation
                 bot.getUserById(msg.user).then(u => {
                    if (u) {
                        players[u.id] = {points: 0, claimedBounties: [], user: u};
                        bot.postMessage(msg.user, 'New mate added successfully!', {as_user: true, icon_emoji: ':cake:'})
                    } else {
                        bot.postMessage(msg.user, 'Sorry please try again (or maually)', {
                            as_user: true,
                            icon_emoji: ':cake:'
                        })
                    }
                }).catch(err => {
                    bot.postMessage(msg.user, 'Sorry please try again (or maually)', {as_user: true, icon_emoji: ':cake:'})
                 });

            } else if (msg.text.indexOf('!test') === 0) {
                console.log(msg);
                bot.getUserById(msg.user).then(data => {
                    console.log(data);
                });
            }
            else {
                nonExistingUser(msg);
            }

        } else {
            if (msg.text.indexOf('!points') === 0) {

                if (msg.text.split(':').length === 4) {
                    var link = msg.text.split(':')[2] + msg.text.split(':')[3]
                    openBounties.push({points: msg.text.split(':')[1], owner: players[msg.user].user, index: bountyIndex, link: link});
                    bot.postMessage(msg.user, `A new bounty (ID: ${bountyIndex}) has beet set to ${msg.text.split(':')[1]} points! \n ${link}`, {as_user: true});
                    bountyIndex++;
                } else {
                    bot.postMessage(msg.user, "please specify the bounty by !points:<number>:<link>", {
                        as_user: true,
                        icon_emoji: ':cake:'
                    })
                }

            } else if (msg.text.indexOf('!getBounty') === 0) {

                if (msg.text.split(':').length === 2) {
                    var isSuccess = false;
                    var i;
                    var sentBountyIndex = msg.text.split(':')[1];
                    openBounties.forEach(bounty, index => {
                        if (bounty.index === sentBountyIndex) {
                            players[msg.user].points += bounty.points;
                            i = index;
                            isSuccess = true;
                        }
                    });

                    if (isSuccess) {
                        bot.postMessage(msg.user, "GREAT JOB! bounty claimed successfully!", {
                            as_user: true,
                            icon_emoji: ':cake:'
                        })
                        openBounties.splice(i, 1);
                    } else {
                        bot.postMessage(msg.user, "bounty was all ready claimed :sad:", {as_user: true})
                    }
                }
                else {
                    bot.postMessage(msg.user, "please specify the bounty index !getBounty:5 ", {as_user: true})
                }

            } else if (msg.text.indexOf('!players') === 0) {

                getPlayers(msg);

            } else if (msg.text.indexOf('!rank') === 0) {

                var ranks = [];
                Object.keys(players).forEach(function (key) {
                    ranks.push(players[key].user.name + ': ' + players[key].points);
                });
                bot.postMessage(msg.user, 'the Ranks are: \n' + ranks.join('\n'), {as_user: true, icon_emoji: ':cake:'})

            } else if (msg.text.indexOf('!open') === 0) {

                var bounties = [];

                openBounties.forEach(b => {
                    bounties.push(b.owner.name + ' - ' + b.points + 'points  ' + b.link)
                });

                bot.postMessage(msg.user, 'the open Bounties are: \n' + bounties.join('\n'), {as_user: true, icon_emoji: ':cake:'})
            }
        }
        break
      }
});

function getPlayers(msg) {
    var names  = [];
    Object.keys(players).forEach(function(key) {
        names.push(players[key].user.name);
    });
    bot.postMessage(msg.user, names.join(','), { as_user: true, icon_emoji: ':cake:'})
}

function nonExistingUser(msg) {
    bot.postMessage(msg.user, 'you are a new user glad to have you in owr crwe! \n to continue please send the following command: !newMate:[here fill your first name and last name name.last] and repeat the action you attempted to do', { as_user: true, icon_emoji: ':cake:'})
}