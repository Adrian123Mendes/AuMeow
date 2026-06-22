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

CREATE TABLE IF NOT EXISTS social_convites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_remetente INT NOT NULL,
  id_destinatario INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  respondido_em TIMESTAMP NULL,
  CONSTRAINT fk_social_convites_remetente
    FOREIGN KEY (id_remetente) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_social_convites_destinatario
    FOREIGN KEY (id_destinatario) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  INDEX idx_social_convites_destinatario_status (id_destinatario, status),
  INDEX idx_social_convites_remetente_status (id_remetente, status)
);

CREATE TABLE IF NOT EXISTS social_conversas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_conversa_participantes (
  id_conversa INT NOT NULL,
  id_usuario INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_conversa, id_usuario),
  CONSTRAINT fk_social_participantes_conversa
    FOREIGN KEY (id_conversa) REFERENCES social_conversas(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_social_participantes_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  INDEX idx_social_participantes_usuario (id_usuario)
);

CREATE TABLE IF NOT EXISTS social_mensagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_conversa INT NOT NULL,
  id_usuario INT NOT NULL,
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_social_mensagens_conversa
    FOREIGN KEY (id_conversa) REFERENCES social_conversas(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_social_mensagens_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  INDEX idx_social_mensagens_conversa_criado (id_conversa, criado_em)
);

INSERT INTO usuarios (id, nome, email, senha, telefone)
VALUES (
  1,
  'Usuário Demo',
  'demo@aumeow.local',
  '$2b$10$dVGhCGx8Lzn.R2fTy3zeK.7XF.o5UetH0cIHJWL2PK4j.kR78M/uO',
  '(00) 00000-0000'
)
ON DUPLICATE KEY UPDATE id = id;
