CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  raca VARCHAR(255),
  idade INT,
  aniversario DATE,
  foto VARCHAR(255),
  signo VARCHAR(100),
  id_usuario INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pets_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lembretes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  data_hora DATETIME NOT NULL,
  local_evento VARCHAR(255),
  descricao TEXT,
  id_usuario INT NOT NULL,
  CONSTRAINT fk_lembretes_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (id, nome, email, senha, telefone)
VALUES (
  1,
  'Usuario Demo',
  'demo@aumeow.local',
  '$2b$10$dVGhCGx8Lzn.R2fTy3zeK.7XF.o5UetH0cIHJWL2PK4j.kR78M/uO',
  '(00) 00000-0000'
)
ON DUPLICATE KEY UPDATE id = id;
