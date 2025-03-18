// Configuração básica do jogo
const config = {
    type: Phaser.AUTO, // Usa WebGL se disponível, caso contrário, usa Canvas
    width: 800, // Largura da tela
    height: 600, // Altura da tela
    physics: { default: 'arcade', arcade: { debug: false } }, // Física arcade simples
    scene: [MenuScene, GameScene, GameScene2, GameOverScene, WinScene] // Cenas do jogo
};

// Inicializa o jogo com a configuração acima
const game = new Phaser.Game(config);

// Cena do Menu Inicial
class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene"); // Nome da cena
    }

    // Carrega os recursos (imagens, sons, etc.)
    preload() {
        this.load.image('startButton', 'assets/start.png'); // Botão de iniciar
        this.load.image('backgroundMenu', 'assets/background_menu.png'); // Fundo do menu
    }

    // Cria os elementos visuais da cena
    create() {
        // Adiciona o fundo do menu
        this.add.image(400, 300, 'backgroundMenu');

        // Texto do título do jogo
        this.add.text(250, 100, "Jogo do Labirinto", { fontSize: "48px", fill: "#fff" });

        // Botão de iniciar o jogo
        let startButton = this.add.image(400, 400, 'startButton').setInteractive();
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene'); // Inicia a cena do jogo ao clicar
        });
    }
}

// Cena do Primeiro Nível
class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
        this.score = 0; // Pontuação do jogador
        this.hasKey = false; // Indica se o jogador coletou a chave
    }

    // Carrega os recursos do primeiro nível
    preload() {
        this.load.image('player', 'assets/player.png'); // Personagem do jogador
        this.load.image('key', 'assets/key.png'); // Chave para coletar
        this.load.image('enemy', 'assets/enemy.png'); // Inimigo
        this.load.image('door', 'assets/door.png'); // Porta para avançar
        this.load.tilemapTiledJSON('map', 'assets/map.json'); // Mapa do jogo
        this.load.image('tiles', 'assets/tileset.png'); // Tileset do mapa
        this.load.image('backgroundGame', 'assets/background_game.png'); // Fundo do jogo
    }

    // Cria os elementos do primeiro nível
    create() {
        // Adiciona o fundo do jogo
        this.add.image(400, 300, 'backgroundGame');

        // Cria o mapa e as camadas
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("tileset", "tiles");
        map.createLayer("Ground", tileset, 0, 0);

        // Adiciona o jogador
        this.player = this.physics.add.sprite(100, 100, 'player');
        this.player.setCollideWorldBounds(true); // Impede que o jogador saia da tela
        this.player.setBounce(0.2); // Adiciona um leve quique ao jogador

        // Gera a chave e a porta
        this.spawnKey();
        this.door = this.physics.add.sprite(500, 200, 'door');

        // Verifica se o jogador entra na porta
        this.physics.add.overlap(this.player, this.door, this.enterDoor, null, this);

        // Adiciona um inimigo
        this.enemy = this.physics.add.sprite(400, 200, 'enemy');
        this.enemy.setVelocity(100, 100); // Define a velocidade do inimigo
        this.enemy.setBounce(1, 1); // Faz o inimigo quicar nas bordas
        this.enemy.setCollideWorldBounds(true); // Impede que o inimigo saia da tela

        // Texto da pontuação
        this.scoreText = this.add.text(16, 16, 'Placar: 0', { fontSize: '32px', fill: '#fff' });

        // Verifica se o jogador coleta a chave
        this.physics.add.overlap(this.player, this.keyItem, this.collectKey, null, this);

        // Verifica se o jogador colide com o inimigo
        this.physics.add.overlap(this.player, this.enemy, () => {
            this.scene.start('GameOverScene'); // Game Over se colidir com o inimigo
        });

        // Configura os controles do teclado
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    // Atualiza o jogo a cada frame
    update() {
        this.player.setVelocity(0); // Reseta a velocidade do jogador

        // Movimentação do jogador
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160); // Move para a esquerda
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160); // Move para a direita
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160); // Move para cima
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160); // Move para baixo
        }
    }

    // Gera a chave em uma posição aleatória
    spawnKey() {
        if (this.keyItem) {
            this.keyItem.destroy(); // Remove a chave anterior, se existir
        }
        let x = Phaser.Math.Between(50, 750); // Posição X aleatória
        let y = Phaser.Math.Between(50, 550); // Posição Y aleatória
        this.keyItem = this.physics.add.sprite(x, y, 'key'); // Cria a chave
        this.physics.add.overlap(this.player, this.keyItem, this.collectKey, null, this); // Verifica colisão com a chave
        this.hasKey = false; // Reseta o estado da chave
    }

    // Coleta a chave
    collectKey(player, key) {
        this.score += 10; // Aumenta a pontuação
        this.scoreText.setText('Placar: ' + this.score); // Atualiza o texto da pontuação
        key.destroy(); // Remove a chave da tela
        this.hasKey = true; // Indica que o jogador coletou a chave
    }

    // Verifica se o jogador entra na porta com a chave
    enterDoor(player, door) {
        if (this.hasKey) {
            this.scene.start('GameScene2'); // Avança para o segundo nível
        }
    }
}

// Cena do Segundo Nível
class GameScene2 extends Phaser.Scene {
    constructor() {
        super("GameScene2");
    }

    // Carrega os recursos do segundo nível
    preload() {
        this.load.image('player', 'assets/player.png'); // Personagem do jogador
        this.load.image('enemy', 'assets/enemy.png'); // Inimigos
        this.load.image('door', 'assets/door.png'); // Portas
        this.load.image('backgroundGame2', 'assets/background_game2.png'); // Fundo do segundo nível
    }

    // Cria os elementos do segundo nível
    create() {
        // Adiciona o fundo do segundo nível
        this.add.image(400, 300, 'backgroundGame2');

        // Texto da fase
        this.add.text(100, 50, "Fase 2 - Escolha a porta certa!", { fontSize: "32px", fill: "#fff" });

        // Adiciona o jogador
        this.player = this.physics.add.sprite(400, 500, 'player');
        this.player.setCollideWorldBounds(true); // Impede que o jogador saia da tela

        // Cria as portas
        this.doors = [
            this.physics.add.sprite(200, 200, 'door'),
            this.physics.add.sprite(400, 200, 'door'),
            this.physics.add.sprite(600, 200, 'door'),
            this.physics.add.sprite(300, 300, 'door')
        ];

        // Escolhe uma porta correta aleatoriamente
        this.correctDoor = Phaser.Math.Between(0, 3);

        // Adiciona os inimigos
        this.enemies = [
            this.physics.add.sprite(100, 100, 'enemy'),
            this.physics.add.sprite(700, 100, 'enemy')
        ];

        // Configura os inimigos
        this.enemies.forEach(enemy => {
            enemy.setCollideWorldBounds(true); // Impede que os inimigos saiam da tela
            enemy.setBounce(1); // Faz os inimigos quicarem
            enemy.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200)); // Define velocidade aleatória
        });

        // Verifica colisão entre jogador e inimigos
        this.physics.add.collider(this.player, this.enemies, () => {
            this.scene.start('GameOverScene'); // Game Over se colidir com um inimigo
        });

        // Define o número de tentativas
        this.attempts = 2;
        this.attemptsText = this.add.text(300, 400, `Tentativas restantes: ${this.attempts}`, { fontSize: "24px", fill: "#fff" });

        // Configura as portas
        this.doors.forEach((door, index) => {
            door.clicked = false; // Marca a porta como não clicada
            this.physics.add.overlap(this.player, door, () => {
                if (!door.clicked) {
                    door.clicked = true; // Marca a porta como clicada

                    if (index === this.correctDoor) {
                        // Se a porta for a correta, o jogador vence
                        door.setTint(0x00ff00); // Pinta a porta de verde
                        this.time.delayedCall(500, () => {
                            this.scene.start('WinScene'); // Vai para a cena de vitória
                        });
                    } else {
                        // Se a porta for errada, perde uma tentativa
                        door.setTint(0xff0000); // Pinta a porta de vermelho
                        this.attempts--; // Reduz o número de tentativas
                        this.attemptsText.setText(`Tentativas restantes: ${this.attempts}`);

                        if (this.attempts <= 0) {
                            // Se as tentativas acabarem, Game Over
                            this.time.delayedCall(500, () => {
                                this.scene.start('GameOverScene');
                            });
                        } else {
                            // Reinicia as portas após um pequeno atraso
                            this.time.delayedCall(1000, () => {
                                this.resetDoors();
                            });
                        }
                    }
                }
            });
        });

        // Configura os controles do teclado
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    // Atualiza o jogo a cada frame
    update() {
        this.player.setVelocity(0); // Reseta a velocidade do jogador

        // Movimentação do jogador
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160); // Move para a esquerda
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160); // Move para a direita
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160); // Move para cima
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160); // Move para baixo
        }
    }

    // Reinicia as portas
    resetDoors() {
        this.doors.forEach(door => {
            door.clicked = false; // Marca a porta como não clicada
            door.clearTint(); // Remove a cor da porta
        });
        this.correctDoor = Phaser.Math.Between(0, 3); // Escolhe uma nova porta correta
        this.attemptsText.setText(`Tentativas restantes: ${this.attempts}`); // Atualiza o texto das tentativas
    }
}

// Cena de Game Over
class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }

    // Carrega o fundo do Game Over
    preload() {
        this.load.image('backgroundGameOver', 'assets/background_gameover.png');
    }

    // Cria a cena de Game Over
    create() {
        this.add.image(400, 300, 'backgroundGameOver'); // Adiciona o fundo
        this.add.text(300, 100, "Game Over", { fontSize: "48px", fill: "#f00" }); // Texto de Game Over
        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene'); // Volta ao menu ao clicar
        });
    }
}

// Cena de Vitória
class WinScene extends Phaser.Scene {
    constructor() {
        super("WinScene");
    }

    // Carrega o fundo da vitória
    preload() {
        this.load.image('backgroundWin', 'assets/background_win.png');
    }

    // Cria a cena de vitória
    create() {
        this.add.image(400, 300, 'backgroundWin'); // Adiciona o fundo
        this.add.text(300, 100, "Você Ganhou!", { fontSize: "48px", fill: "#0f0" }); // Texto de vitória
        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene'); // Volta ao menu ao clicar
        });
    }
}