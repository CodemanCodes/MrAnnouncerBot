﻿using System;
using System.Linq;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace DndCore
{
	public class DndGame
	{
		DndMap activeMap;

		List<DndMap> maps = new List<DndMap>();

		List<Monster> monsters = new List<Monster>();

		public DndGame()
		{
		}

		public DndMap ActiveMap
		{
			get => activeMap;
			set
			{
				ActivateMap(value);
			}
		}

		public DndRoom ActiveRoom
		{
			get
			{
				return ActiveMap?.ActiveRoom;
			}
		}

		public List<Character> Players { get; } = new List<Character>();

		public DndMap ActivateMap(DndMap map)
		{
			activeMap = maps.FirstOrDefault(x => x == map);
			return activeMap;
		}

		public DndMap ActivateMap(string mapName)
		{
			return maps.FirstOrDefault(x => x.Name == mapName);
		}

		public void ActivateRoom(DndRoom dndRoom)
		{
			if (dndRoom.Map == null)
				throw new DndException("Cannot activate a room that has not been added to a map!");
			dndRoom.Map.ActivateRoom(dndRoom);
		}
		public DndMap AddMap(DndMap dndMap)
		{
			dndMap.Game = this;
			maps.Add(dndMap);
			return dndMap;
		}

		public Monster AddMonster(Monster monster)
		{
			monsters.Add(monster);
			return monster;
		}
		public Character AddPlayer(Character character)
		{
			character.Game = this;
			Players.Add(character);
			return character;
		}
		public void EnterCombat(bool value)
		{
			throw new NotImplementedException();
		}
		public void MoveAllPlayersToActiveRoom()
		{
			throw new NotImplementedException();
		}
		public void QueueAction(Creature creature, ActionAttack actionAttack)
		{
			// TODO: Implement this!!!
		}
	}
}
