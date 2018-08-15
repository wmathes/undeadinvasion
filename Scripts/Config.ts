

var Config = {
    Game: {
        Width: 900,
        Height: 700
    },
    Difficulties: {
        Easy: {
            InitialZombies: 6,
            DelayMax: 1800,
            DelayMin: 750,
            AmountStep: 100,
            ScoreFactor: 0.75,
            EnemyHealthFactor: 0.80,
            EnemyDamageFactor: 0.5,
            EnemySpeedFactor: 0.8,
            MaxEnemies: 250,
            HealEvery: 500,
            PowerUpChance: 0.06,
            PowerUpLifetime: 12800
            //MaxEnemies: 1
        },
        Normal: {
            InitialZombies: 12,
            DelayMax: 1400,
            DelayMin: 500,
            AmountStep: 80,
            ScoreFactor: 1,
            EnemyHealthFactor: 1,
            EnemyDamageFactor: 1,
            EnemySpeedFactor: 1,
            MaxEnemies: 400,
            HealEvery: 800,
            PowerUpChance: 0.05,
            PowerUpLifetime: 10400
        },
        Hard: {
            InitialZombies: 24,
            DelayMax: 1000,
            DelayMin: 375,
            AmountStep: 60,
            ScoreFactor: 1.5,
            EnemyHealthFactor: 1.1,
            EnemyDamageFactor: 1.5,
            EnemySpeedFactor: 1.25,
            MaxEnemies: 650,
            HealEvery: 1200,
            PowerUpChance: 0.04,
            PowerUpLifetime: 8000
        },
        Ultra: {
            InitialZombies: 48,
            DelayMax: 600,
            DelayMin: 250,
            AmountStep: 50,
            ScoreFactor: 2.0,
            EnemyHealthFactor: 1.2,
            EnemyDamageFactor: 2.0, 
            EnemySpeedFactor: 1.5,
            MaxEnemies: 900,
            HealEvery: 1500,
            PowerUpChance: 0.03,
            PowerUpLifetime: 6400
        }
    },
    Effects: {
        Blood: {
            Duration: 40000,
            Maximum: 80,
            Image: "bloodSplatter",
            Variations: 1,
            Width: 42,
            Height: 31
        },
        Bones: {
            Duration: 15000,
            Maximum: 20,
            Image: "bones",
            Variations: 1,
            Width: 30,
            Height: 22
        }
    }
};
