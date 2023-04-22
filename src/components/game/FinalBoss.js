import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import '../../styles/game/FinalBoss.css';

import bossBackground from '../../assets/images/map/bossBackground.png';
import healthBar from '../../assets/images/ui/healthBar.png';

import allyIdle from '../../assets/images/ally/allyIdle.gif';
import allyAttack from '../../assets/images/ally/allyAttack.gif';
import allyHit from '../../assets/images/ally/allyHit.gif';
import allySpecial from '../../assets/images/ally/allySpecial.gif';

import bossIdle from '../../assets/images/Monster/BossIdle.gif';
import bossAttackGif from '../../assets/images/Monster/BossAttack.gif';
import bossHitGif from '../../assets/images/Monster/BossHit.gif';
import bossSpecialGif from '../../assets/images/Monster/BossSpecial.gif';

import speechBubble from '../../assets/images/ui/speechBubble.png';
import talkButton from '../../assets/images/ui/talkButton.png';

import block from "../../assets/images/ui/block.png";

const generateBossDamage = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const generatePlayerShield = (shieldValue) => {
  const shieldArray = [];
  for (let i = 1; i <= shieldValue; i++) {
    shieldArray.push(i);
  }

  return shieldArray;
}

const FinalBoss = () => {
  const [bossSpeech, setBossSpeech] = useState('So you made it');
  const [showTalkButton, setShowTalkButton] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const { selectedCharacter } = location.state || {};
  const [character, setCharacter] = useState(selectedCharacter);

  //Boss
  const [bossHealth, setBossHealth] = useState(50);
  const bossMaxHealth = 50;
  const [bossGif, setBossGif] = useState(bossIdle);
  const [bossAttack, setBossAttack] = useState(generateBossDamage(4, 10));

  //Player
  const [playerTurn, setPlayerTurn] = useState(true);
  const [playerAttack, setPlayerAttack] = useState(null);
  const [showAttack, setShowAttackGif] = useState(false);
  const [playerHit, setPlayerHit] = useState(null);
  const [showPlayerHit, setShowPlayerHit] = useState(false);
  const [playerShield, setPlayerShield] = useState(0);
  const [attackCardCooldown, setAttackCardCooldown] = useState(0);
  const [defendCardCooldown, setDefendCardCooldown] = useState(0);
  const [specialCardCooldown, setSpecialCardCooldown] = useState(0);

  //Ally
  const [allyAttackGif, setAllyAttackGif] = useState(null);
  const [showAllyAttack, setAllyShowAttack] = useState(false);
  const [allyHit, setAllyHitGif] = useState(null);
  const [showAllyHit, setShowAllyHit] = useState(false);

  //shakeScreen
  const [shakeScreen, setShakeScreen] = useState(false);
  const [showBossAttack, setShowBossAttack] = useState(false);

  const [showBattleElements, setShowBattleElements] = useState(false);
  const [hideSpeechBubble, setHideSpeechBubble] = useState(false);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    setCharacter(selectedCharacter);
    if (selectedCharacter) {
      setPlayerAttack(selectedCharacter.attackGif);
      setPlayerHit(selectedCharacter.hitGif);
    }
  }, [selectedCharacter]);

  useEffect(() => {
    if (bossSpeech === 'So you made it') {
      setShowBossAttack(true);

      setTimeout(() => {
        setShowBossAttack(false);
      }, 2050); // Duration of the bossSpecialGif

      setTimeout(() => {
        setShakeScreen(true);

        setTimeout(() => {
          setShakeScreen(false);
        }, 1000); // Duration of the shake effect
      }, 2050); // Delay the shake effect to start after the bossSpecialGif finishes
    }
  }, [bossSpeech]);

  const handleTalkButtonClick = () => {
    if (bossSpeech === 'So you made it') {
      setBossSpeech('Such a waste');
    } else if (bossSpeech === 'Such a waste') {
      setShowTalkButton(false);
      setShowBattleElements(true);
      setHideSpeechBubble(true);
    }
  };

  const handleBossAttack = async (defense = 0) => {
    // Show the Boss attack 
    setBossGif(bossAttackGif);

    // Wait for the attack animation to finish
    await delay(1050);

    // Show the player's hit gif
    setShowPlayerHit(true);

    // Wait for the hit animation to finish
    await delay(500);

    // Hide the player's hit gif
    setShowPlayerHit(false);

    setBossAttack(generateBossDamage(4, 10));

    // Calculate the damage dealt after accounting for the shield
    const damageDealt = Math.max(bossAttack - defense, 0);

    // Update the player's shield
    setPlayerShield((prevShield) => Math.max(prevShield - bossAttack, 0));

    // Update the player's health
    setCharacter((prevCharacter) => ({
      ...prevCharacter,
      health: prevCharacter.health - damageDealt,
    }));

    // Revert the monster's GIF to idle
    setBossGif(bossIdle);

    await delay(300);
    setPlayerShield(0);
    // Set the player's turn back to true
    setPlayerTurn(true);
  };

  const handlePlayerAttack = async (damage, special = false) => {
    if (damage === null) return;
  
    setPlayerAttack(special ? selectedCharacter.specialAttackGif : selectedCharacter.attackGif);
    setShowAttackGif(true);
  
    // Wait for the attack animation to finish
    await delay(800);
  
    // Hide the attack GIF
    setShowAttackGif(false);
  
    // Reset the attack animation
    setPlayerAttack(null);
    await delay(50);
  
    if (bossHealth - damage <= 0) {
      setBossHealth(0);
    } else {
      // Update the monster's health and show the hit GIF
      setBossHealth((prevHealth) => {
        const updatedBossHealth = prevHealth - damage;
        return updatedBossHealth;
      });
  
      setBossGif(bossHitGif);
  
      // Wait for the hit animation to finish
      await delay(750);
  
      // Revert monster's gif to idle
      setBossGif(bossIdle);
  
      // Call the monster's attack
      setPlayerTurn(false);
      handleBossAttack();
    }
  
    // Set the attack or special card cooldown
    if (special) {
      setSpecialCardCooldown(2);
    } else {
      setAttackCardCooldown(1);
    }
  };
  
  
  const handleCardAttack = (card) => {
    if (!playerTurn) return;

    // Decrement the cooldowns at the beginning of each turn
    setAttackCardCooldown((prevCooldown) => Math.max(prevCooldown - 1, 0));
    setDefendCardCooldown((prevCooldown) => Math.max(prevCooldown - 1, 0));
    setSpecialCardCooldown((prevCooldown) => Math.max(prevCooldown - 1, 0));

    if (
      (card.type === "attack" && attackCardCooldown > 0) ||
      (card.type === "defend" && defendCardCooldown > 0) ||
      (card.type === "special" && specialCardCooldown > 0)
    ) {
      return;
    }

    if (card.type === "defend") {
      handleDefendCard(card);
    } else {
      const damage = card.attack;
      console.log(`Card deals ${damage} damage.`);
      handlePlayerAttack(damage, card.type === "special");
    }
  };

  const handleDefendCard = (card) => {
    if (!playerTurn) return;

    // Update the player's shield
    setPlayerShield(card.defense);

    // Call the monster's attack
    setPlayerTurn(false);
    handleBossAttack(card.defense);

    // Set the defend card cooldown after the action
    setDefendCardCooldown(1);
  };


  return (
    <div
      className={`final-boss-container${shakeScreen ? ' shake' : ''}`}
      style={{ backgroundImage: `url(${bossBackground})` }}
    >

      <img
        className="character-boss"
        src={showBossAttack ? bossSpecialGif : bossGif}
        alt="Boss"
      />
      <img className="character-ally" src={allyIdle} alt="Ally" />

      {selectedCharacter && !showAttack && !showPlayerHit && (
        <img
          className="character player"
          src={selectedCharacter.idleGif}
          alt={selectedCharacter.name}
        />
      )}
      {showAttack && (
        <img
          className="character player-attack"
          src={playerAttack}
          alt={`${selectedCharacter.name} attack`}
        />
      )}
      {showPlayerHit && (
        <img
          className="character player-hit"
          src={playerHit}
          alt={`${selectedCharacter.name} hit`}
        />
      )}

      <div className="player-shield-container">
        {generatePlayerShield(playerShield).map((shieldValue) => (
          <img
            key={shieldValue}
            className="player-shield"
            src={block}
            alt="Shield Icon"
          />
        ))}
      </div>

      <div className="health-bar-container1 player">
        <img
          className="health-bar"
          src={healthBar}
          alt="Health bar"
          style={{
            width: `${(character.health / character.max_health) * 100}%`,
          }}
        />
        <span className="health-text">
          {character.health}/{character.max_health}
        </span>
      </div>

      <div className="health-bar-container1 boss">
        <img
          className="health-bar"
          src={healthBar}
          alt="boss Health bar"
          style={{
            width: `${(bossHealth / bossMaxHealth) * 100}%`,
          }}
        />
        <span className="health-text">
          {bossHealth}/{bossMaxHealth}
        </span>
      </div>


      <div className={`speech-bubble-container${(showBattleElements || hideSpeechBubble) ? ' hidden' : ''}`}>
        <img className="speech-bubble" src={speechBubble} alt="Speech Bubble" />
        <div className="boss-text">
          {[...bossSpeech].map((char, index) => (
            <span key={index}>{char === ' ' ? '\u00A0' : char}</span>
          ))}
        </div>
      </div>

      {showBattleElements && (
        <span className="boss-attack">
          {bossAttack}
        </span>
      )}

      {showBattleElements && (
        <div className="card-deck">
          {character.startingDeck.map((card) => (
            <img
              key={card.id}
              className={`card1 ${card.type === 'attack' && attackCardCooldown > 0 ? 'cooldown' : ''}${card.type === 'defend' && defendCardCooldown > 0 ? 'cooldown' : ''}${card.type === 'special' && specialCardCooldown > 0 ? 'cooldown' : ''}`}
              src={card.image_url}
              alt={`Card ${card.id}`}
              onClick={() => handleCardAttack(card)}
            />
          ))}
        </div>
      )}

      {showTalkButton && (
        <img
          className="talk-button"
          src={talkButton}
          alt="Talk Button"
          onClick={handleTalkButtonClick}
        />
      )}

    </div>
  );
};

export default FinalBoss;
