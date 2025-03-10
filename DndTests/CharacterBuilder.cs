﻿using DndCore;
using System;

namespace DndTests
{
	public static class CharacterBuilder
	{
		public static Character BuildTestElf(string name = "")
		{
			Character elf = new Character();
			elf.kind = CreatureKinds.Humanoids;
			
			if (string.IsNullOrEmpty(name))
				elf.name = "Taragon";
			else
				elf.name = name;

			elf.raceClass = "Wood Elf Barbarian";
			elf.alignment = "Chaotic Good";
			elf.baseArmorClass = 12;
			GenerateRandomAttributes(elf);
			elf.remainingHitDice = "1 d10";
			elf.level = 1;
			elf.inspiration = "";

			elf.initiative = 2;
			elf.baseSpeed = 30;
			elf.hitPoints = 47;
			elf.tempHitPoints = 0;
			elf.maxHitPoints = 55;
			elf.proficiencyBonus = 2;
			elf.savingThrowProficiency = Ability.Intelligence | Ability.Charisma;
			elf.proficientSkills = Skills.acrobatics | Skills.deception | Skills.slightOfHand;
			elf.deathSaveLife1 = true;
			//elf.deathSaveLife2 = true;
			//elf.deathSaveLife3 = true;
			elf.deathSaveDeath1 = true;
			elf.deathSaveDeath2 = true;
			//elf.deathSaveDeath3 = true;

			return elf;
		}
		public static void GenerateRandomAttributes(Character character)
		{
			character.baseCharisma = Die.getAbilityScore();
			character.baseConstitution = Die.getAbilityScore();
			character.baseDexterity = Die.getAbilityScore();
			character.baseWisdom = Die.getAbilityScore();
			character.baseIntelligence = Die.getAbilityScore();
			character.baseStrength = Die.getAbilityScore();
			character.experiencePoints = 1234;
			character.goldPieces = 4321;
			character.weight = 144;
			character.load = 166;
		}

		public static Character BuildTestBarbarian(string name = "")
		{
			Character barbarian = new Character();
			barbarian.kind = CreatureKinds.Humanoids;

			if (string.IsNullOrEmpty(name))
				barbarian.name = "Ava";
			else
				barbarian.name = name;
			barbarian.raceClass = "Dragonborn Barbarian";
			barbarian.alignment = "Chaotic Evil";
			barbarian.baseArmorClass = 14;
			GenerateRandomAttributes(barbarian);
			barbarian.remainingHitDice = "1 d10";
			barbarian.level = 1;
			barbarian.inspiration = "";

			barbarian.initiative = 2;
			barbarian.baseSpeed = 30;
			barbarian.hitPoints = 127;
			barbarian.tempHitPoints = 3;
			barbarian.maxHitPoints = 127;
			barbarian.proficiencyBonus = 2;
			barbarian.savingThrowProficiency = Ability.Strength | Ability.Dexterity;
			barbarian.proficientSkills = Skills.acrobatics | Skills.intimidation | Skills.athletics;
			barbarian.deathSaveLife1 = true;
			barbarian.deathSaveLife2 = true;
			//elf.deathSaveLife3 = true;
			barbarian.deathSaveDeath1 = true;
			barbarian.deathSaveDeath2 = true;
			//elf.deathSaveDeath3 = true;

			return barbarian;
		}

		public static Character BuildTestWizard(string name = "")
		{
			Character wizard = new Character();
			wizard.kind = CreatureKinds.Humanoids;
			if (string.IsNullOrEmpty(name))
				wizard.name = "Morkin";
			else
				wizard.name = name;
			
			wizard.raceClass = "Human Wizard";
			wizard.alignment = "Chaotic Neutral";
			wizard.baseArmorClass = 10;
			GenerateRandomAttributes(wizard);
			wizard.remainingHitDice = "1 d8";
			wizard.level = 1;
			wizard.inspiration = "";

			wizard.initiative = 2;
			wizard.baseSpeed = 30;
			wizard.hitPoints = 33;
			wizard.tempHitPoints = 0;
			wizard.maxHitPoints = 127;
			wizard.proficiencyBonus = 2;
			wizard.savingThrowProficiency = Ability.Intelligence | Ability.Charisma;
			wizard.proficientSkills = Skills.arcana | Skills.slightOfHand | Skills.deception;
			wizard.Equip(Weapon.buildShortSword());
			wizard.Pack(Weapon.buildBlowgun());
			wizard.Pack(Ammunition.buildBlowgunNeedlePack());

			return wizard;
		}
		public static Character BuildTestDruid(string name = "")
		{
			Character druid = new Character();
			druid.kind = CreatureKinds.Humanoids;
			if (string.IsNullOrEmpty(name))
				druid.name = "Kylee";
			else
				druid.name = name;
			
			druid.raceClass = "Wood Elf Druid";
			druid.alignment = "Lawful Good";
			druid.baseArmorClass = 10;
			GenerateRandomAttributes(druid);
			druid.remainingHitDice = "1 d8";
			druid.level = 1;
			druid.inspiration = "";

			druid.initiative = 2;
			druid.baseSpeed = 30;
			druid.hitPoints = 27;
			druid.tempHitPoints = 0;
			druid.maxHitPoints = 44;
			druid.proficiencyBonus = 2;
			druid.savingThrowProficiency = Ability.Wisdom | Ability.Dexterity;
			druid.proficientSkills = Skills.animalHandling | Skills.nature | Skills.medicine;

			return druid;
		}
	}
}
