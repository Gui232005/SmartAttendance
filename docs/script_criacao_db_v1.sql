-- =======================================================================
-- 2) TIPOS ENUM (para maior segurança nos valores)
-- =======================================================================

-- Tipos de evento de presença
CREATE TYPE tipo_evento AS ENUM (
    'ENTRADA',
    'SAIDA',
    'ALMOCO_IN',
    'ALMOCO_OUT',
    'CORRECAO'
);


-- =======================================================================
-- 3) TABELAS
-- =======================================================================

-- -----------------------------
-- Tabela: funcionario
-- -----------------------------
CREATE TABLE funcionario (
    id              SERIAL PRIMARY KEY,
    nome            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    -- opcionalmente dados extra (departamento, numero_mecanografico, etc.)
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger simples de updated_at (se quiseres usar):
-- (podes ignorar se fores gerir isto com o Sequelize)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_funcionario_updated
BEFORE UPDATE ON funcionario
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- -----------------------------
-- Tabela: face_template
-- Cada registo = um embedding de rosto de um funcionário
-- -----------------------------
CREATE TABLE face_template (
    id                  SERIAL PRIMARY KEY,
    funcionario_id      INTEGER NOT NULL
        REFERENCES funcionario(id)
        ON DELETE CASCADE,
    -- Vetor de embeddings; tamanho exato depende do modelo (128, 512, ...)
    embedding_vector    DOUBLE PRECISION[] NOT NULL,
    qualidade           REAL,                       -- métrica de qualidade da face
    thumbnail_path      TEXT,                       -- caminho para imagem/thumbnail (se usares)
    ativo               BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_face_template_funcionario
    ON face_template(funcionario_id);


-- -----------------------------
-- Tabela: evento
-- Registo de entradas/saídas/almoco, etc.
-- -----------------------------
CREATE TABLE evento (
    id                  SERIAL PRIMARY KEY,
    funcionario_id      INTEGER
        REFERENCES funcionario(id)
        ON DELETE SET NULL,
    tipo                tipo_evento NOT NULL,
    instante            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    origem              VARCHAR(30) NOT NULL DEFAULT 'EDGE', -- ex: EDGE / MANUAL / IMPORT
    conf                REAL,                                -- confiança (0–1)
    revisto             BOOLEAN NOT NULL DEFAULT FALSE,      -- se foi corrigido manualmente
    observacoes         TEXT
);

CREATE INDEX idx_evento_funcionario
    ON evento(funcionario_id);

CREATE INDEX idx_evento_instante
    ON evento(instante);

CREATE INDEX idx_evento_revisto_false
    ON evento(revisto)
    WHERE revisto = FALSE;


-- -----------------------------
-- Tabela: utilizador_app
-- Utilizadores da aplicação web (login, perfis)
-- -----------------------------
CREATE TABLE utilizador_app (
    id                  SERIAL PRIMARY KEY,
    username            VARCHAR(80) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    perfil              VARCHAR(30) NOT NULL,  -- ex.: 'admin', 'gestor', 'rh'...
    funcionario_id      INTEGER
        REFERENCES funcionario(id)
        ON DELETE SET NULL,
    ativo               BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_utilizador_app_updated
BEFORE UPDATE ON utilizador_app
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =======================================================================
-- 4) DADOS DE TESTE (OPCIONAL)
-- =======================================================================

-- Funcionário de exemplo
INSERT INTO funcionario (nome, email)
VALUES ('Ana Silva', 'ana.silva@empresa.pt');

-- Utilizador admin da app (password_hash é só exemplo!)
INSERT INTO utilizador_app (username, password_hash, perfil)
VALUES ('admin', '$2b$10$HASH_AQUI', 'admin');

-- Evento de teste
INSERT INTO evento (funcionario_id, tipo, origem, conf, observacoes)
VALUES (1, 'ENTRADA', 'EDGE', 0.98, 'Teste inicial do sistema');
