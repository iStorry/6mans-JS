const { determinePlayerQueue, deletePlayerQueue } = require('../utils/managePlayerQueues')

module.exports = (oldMember, newMember) => {
  const queue = determinePlayerQueue(newMember.user.id, undefined)
  const guild = newMember.guild

  // Player is not in a queue
  if (!queue) return

  // Player is in a queue
  const {
    teams: { blue, orange },
    lobby,
  } = queue

  // Track how many users joined the voice channels
  if (newMember.voiceChannelID === blue.voiceChannelID) {
    blue.voiceChannelHistory[newMember.user.id] = true
  }

  if (newMember.voiceChannelID === orange.voiceChannelID) {
    orange.voiceChannelHistory[newMember.user.id] = true
  }

  // Automatically delete the channels after all players have left their voice channels
  if (
    (oldMember.voiceChannelID === blue.voiceChannelID || oldMember.voiceChannelID === orange.voiceChannelID) &&
    (newMember.voiceChannelID !== blue.voiceChannelID || newMember.voiceChannelID !== orange.voiceChannelID)
  ) {
    if (Object.keys(blue.voiceChannelHistory).length >= 1 && Object.keys(orange.voiceChannelHistory).length >= 1) {
      const blueVoiceChannel = guild.channels.find(channelObj => channelObj.id === blue.voiceChannelID)
      const orangeVoiceChannel = guild.channels.find(channelObj => channelObj.id === orange.voiceChannelID)

      if (blueVoiceChannel.members.size === 0 && orangeVoiceChannel.members.size === 0) {
        // Delete the voice com channels
        blueVoiceChannel.delete()
        orangeVoiceChannel.delete()

        // Delete the player queue
        deletePlayerQueue(lobby.id)
      }
    }
  }
}