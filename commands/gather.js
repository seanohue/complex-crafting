'use strict';

const {Random} = require('rando-js');
const {
  Broadcast: B,
} = require('ranvier');

const ItemUtil = require('bundles/myelin-lib/lib/ItemUtil');
const ArgParser = require('bundles/bundle-example-lib/lib/ArgParser');

module.exports = {
  usage: 'gather <resource>',
  aliases: ['salvage', 'collect', 'scavenge'], // TODO: Add 'butcher'
  command: state => (args, player) => {
    if (!args || !args.length) {
      return B.sayAt(player, "Gather what?");
    }

    let node = ArgParser.parseDot(args, player.room.items);

    if (!node) {
      return B.sayAt(player, "You don't see anything like that here.");
    }

    const resource = node.getBehavior('resource');
    if (!resource) {
      return B.sayAt(player, "You can't gather anything from that.");
    }

    if (!player.getMeta('resources')) {
      player.setMeta('resources', {});
    }

    for (const material in resource.materials) {
      const entry = resource.materials[material];
      const amount = Random.inRange(entry.min, entry.max);
      if (amount) {
        player.emit('resources', material, amount);
      }
    }

    if (resource.keepItem) {
      return node.behaviors.delete('resources');
    } 

    // destroy node, will be respawned
    state.ItemManager.remove(node);
    B.sayAt(player, `${ItemUtil.display(node)} ${resource.depletedMessage}`);
    node = null;
  }
};

