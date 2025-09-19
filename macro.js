// Description - Ability Scores Macro
// * Rolls an ability score 6 times: STR, DEX, CON, CHA, WIS, INT
// * Uses roll formula '4d6kh3' or '4d6dl1' (keep highest 3 or drop lowest 1)
// * Displays the results to the chat.

let formula = "4d6kh3"; 							// formula for rolling 4 dice and keeping the highest 3 rolls
let player = game.user;								// access the current player
let playerName = player.name;						// current player's name
let results = [];									// array for holding our total rolls


for (let i = 0; i < 6; i++)
{
	// Construct the Roll instance
	let roll = new Roll(formula);

	// Execute the roll
	await roll.evaluate({async: true});
	results.push(roll.total)	// saves total roll to array

	// Debug console
	console.log(roll.result);	// ex: 2, 3, 4, 4 -> 3, 4, 4
	console.log(roll.total); 	// ex: 11

	// Display roll as chat message
	roll.toMessage(
	{
		flavor: `${playerName} is rolling for ability scores...`,
		speaker: ChatMessage.getSpeaker(),
	}
	);
}

// Summary message
ChatMessage.create(
{
	content: `<b>${playerName}'s Ability Scores:</b> ${results.join(", ")}`,
	speaker: ChatMessage.getSpeaker(),
});

// Description - Gracie's Infestation Macro (Fully Automated)
// * Player selects target token then select this macro to automate the cantrip cast.
// * Handles the save, fail, and success.
// * Macro rolls the target's CON save against player's Spell DC
// * On success, roll 1d6 poison damage + roll 1d4 for direction (N,E,S,W)
// * Display the results in chat.

// The player's info
let actor = game.user.character;
let caster = `<strong>${actor.name}</strong>`;
let spellDC = actor.system.attributes.spelldc;
let spellName = "<strong>Infestation</strong>";

// Select one token to target with cantrip
let targets = Array.from(game.user.targets); 	// the array of all tokens selected by player
let target = targets[0].actor;					// select the first target
let targetName = `<strong>${target.name}</strong>`;

// Casting message
ChatMessage.create(
{
	content: `${caster} casts ${spellName} on ${targetName}!`
}
);

// Rolls the target's CON save against the Spell DC
let conSave = target.system.abilities.con.save;
let saveRoll = new Roll(`1d20 + ${conSave}`);
await saveRoll.evaluate();
saveRoll.toMessage(
{
	flavor: `${targetName} makes a Constitution saving throw! (DC ${spellDC})`,
	speaker: ChatMessage.getSpeaker({ actor: target }),
}	
);

if (saveRoll.total < spellDC)	// fails CON save
{
	// Damage Roll
	let damage = new Roll("1d6");	// 1d6 poison damage
	await damage.evaluate();
	
	damage.toMessage(
	{
		flavor: `Biting insects swarm across ${targetName}, leaving a burning sting!`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
	}	
	);

	// Apply the damage to the token automatically
	await target.applyDamage(damage.total, "poison");

	// Direction Roll
	let direction = new Roll("1d4"); // direction roll: 1 = North, 2 = South, 3 = West, 4 = East
	await direction.evaluate();
	
	direction.toMessage(
	{
		flavor: `As bugs wriggle into its skin, ${targetName} tries to flee!`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
	}	
	);

	let compass = null;
	switch (direction.total)
	{
		case 1: compass = "North";
				break;
		case 2: compass = "South";
				break;
		case 3: compass = "West";
				break;
		case 4: compass = "East";
				break;
	}

	// Spell Summary
	ChatMessage.create(
	{
		flavor: `Combat Summary`,
		content: `${caster} casts ${spellName} on ${targetName}!<br>
		${targetName} takes ${damage.total} poison damage!<br>
		${targetName} tries to move ${compass}!`
	}
	);
}
else
{
	ChatMessage.create(
	{
		content: `... but the spell fails!`
	}
	);
}


// Description - Gracie's Infestation Macro (Quick n' Dirty)
// * Requires DM to select target and roll CON save themselves.
// * To be used after player declares target and DM rolls a failing CON save
// * Basically, just rolls the damage and direction for player after a success.

// The player's info
let actor = game.user.character;
let caster = actor.name;
let spellName = "Infestation";

// Damage Roll
let damage = new Roll("1d6");	// 1d6 poison damage
await damage.evaluate({async: true});

damage.toMessage(
{
	speaker: ChatMessage.getSpeaker({ actor: actor }),
}	
);

// Direction Roll
let direction = new Roll("1d4"); // direction roll: 1 = North, 2 = South, 3 = West, 4 = East
await direction.evaluate({async: true});

direction.toMessage(
{
	speaker: ChatMessage.getSpeaker({ actor: actor }),
}	
);

const directions =	// maps the rolls to direction
{
	1: "North",
	2: "South",
	3: "East",
	4: "West"
};

let compass = directions[direction.total];

// Spell Summary
ChatMessage.create(
{
	content: `${caster} casts ${spellName}!<br>
	${caster} deals ${damage.total} poison damage.<br>
	Target tries to move ${compass}!`
}
);