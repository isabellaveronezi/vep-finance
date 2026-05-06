--
-- PostgreSQL database dump
--

\restrict gB99fj6vuxARIdaxsfEwzG0STnzlX69rB4A52COU3CNKhI5cwD6Rx6700Af3VD3

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: FormaPagamento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FormaPagamento" AS ENUM (
    'DINHEIRO',
    'PIX',
    'DEBITO',
    'CREDITO',
    'BOLETO',
    'TRANSFERENCIA'
);


--
-- Name: OrigemTransacao; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrigemTransacao" AS ENUM (
    'MANUAL',
    'WHATSAPP',
    'IMPORTACAO'
);


--
-- Name: StatusDivida; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StatusDivida" AS ENUM (
    'ABERTA',
    'RECEBIDA',
    'PARCIAL'
);


--
-- Name: StatusDividaPropria; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StatusDividaPropria" AS ENUM (
    'ABERTA',
    'QUITADA'
);


--
-- Name: StatusTransacao; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StatusTransacao" AS ENUM (
    'PAGO',
    'PENDENTE',
    'PARCELADO'
);


--
-- Name: TipoAlerta; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoAlerta" AS ENUM (
    'ORCAMENTO_80',
    'ORCAMENTO_90',
    'ORCAMENTO_100',
    'VENCIMENTO_CONTA',
    'CARTAO_LIMITE',
    'SOBRA_BAIXA',
    'META_CONCLUIDA'
);


--
-- Name: TipoTransacao; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoTransacao" AS ENUM (
    'ENTRADA',
    'SAIDA'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: alertas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alertas (
    id text NOT NULL,
    tipo public."TipoAlerta" NOT NULL,
    mensagem text NOT NULL,
    lido boolean DEFAULT false NOT NULL,
    enviado boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: cartoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cartoes (
    id text NOT NULL,
    nome text NOT NULL,
    bandeira text,
    limite double precision,
    "diaFechamento" integer NOT NULL,
    "diaVencimento" integer NOT NULL,
    cor text,
    ativo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: categorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categorias (
    id text NOT NULL,
    nome text NOT NULL,
    tipo public."TipoTransacao" NOT NULL,
    icone text,
    cor text,
    ativo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: contas_fixas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contas_fixas (
    id text NOT NULL,
    descricao text NOT NULL,
    valor double precision NOT NULL,
    "diaVencimento" integer NOT NULL,
    recorrente boolean DEFAULT true NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "categoriaId" text,
    tipo public."TipoTransacao" DEFAULT 'SAIDA'::public."TipoTransacao" NOT NULL,
    "dataInicio" timestamp(3) without time zone
);


--
-- Name: dividas_proprias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dividas_proprias (
    id text NOT NULL,
    credor text NOT NULL,
    descricao text,
    "valorTotal" double precision NOT NULL,
    parcelas integer,
    vencimento timestamp(3) without time zone,
    status public."StatusDividaPropria" DEFAULT 'ABERTA'::public."StatusDividaPropria" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: dividas_terceiros; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dividas_terceiros (
    id text NOT NULL,
    "nomeDevedor" text NOT NULL,
    descricao text,
    "valorTotal" double precision NOT NULL,
    "valorRecebido" double precision DEFAULT 0 NOT NULL,
    vencimento timestamp(3) without time zone,
    status public."StatusDivida" DEFAULT 'ABERTA'::public."StatusDivida" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "cartaoId" text,
    "formaPagamento" public."FormaPagamento",
    grupo text
);


--
-- Name: metas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metas (
    id text NOT NULL,
    nome text NOT NULL,
    descricao text,
    "valorObjetivo" double precision NOT NULL,
    "valorAtual" double precision DEFAULT 0 NOT NULL,
    "aportesMensal" double precision,
    "prazoEstimado" timestamp(3) without time zone,
    icone text,
    ativo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: orcamentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orcamentos (
    id text NOT NULL,
    "valorLimite" double precision NOT NULL,
    "mesAno" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "categoriaId" text
);


--
-- Name: subcategorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subcategorias (
    id text NOT NULL,
    nome text NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    "categoriaId" text NOT NULL
);


--
-- Name: transacoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transacoes (
    id text NOT NULL,
    descricao text NOT NULL,
    tipo public."TipoTransacao" NOT NULL,
    valor double precision NOT NULL,
    data timestamp(3) without time zone NOT NULL,
    status public."StatusTransacao" DEFAULT 'PENDENTE'::public."StatusTransacao" NOT NULL,
    "formaPagamento" public."FormaPagamento",
    observacao text,
    origem public."OrigemTransacao" DEFAULT 'MANUAL'::public."OrigemTransacao" NOT NULL,
    "numeroParcela" integer,
    "totalParcelas" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "categoriaId" text,
    "subcategoriaId" text,
    "cartaoId" text,
    "dividaId" text,
    recorrente boolean DEFAULT false NOT NULL,
    "contaFixaId" text,
    "dividaPropiaId" text,
    "contaOrcamento" boolean DEFAULT false NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    phone text
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c290287f-f6a0-4245-bf8c-228076fdba61	d5d9baeede89b6fc17b2798b2be890479f19015dbf6b56e400ed99d0641fc848	2026-04-11 17:19:30.509168+00	20260411171930_init	\N	\N	2026-04-11 17:19:30.437233+00	1
6dbd3dfe-2825-4694-89ac-2f2ef1a4abd2	74ac8508b65cbbb4aea1d478d4b66b2351cf80e50bfa4dfb43eef41ab654f264	2026-04-11 19:11:04.836557+00	20260411191104_add_recorrente_transacao	\N	\N	2026-04-11 19:11:04.831755+00	1
8701316e-71e0-4367-adc4-bf9f7c4de007	94ecb88231da405f37ebf523ebaa9c023d9dd0ad64dd7809a59db07b582a7091	2026-04-12 23:27:58.051454+00	20260412232758_add_conta_fixa_link_to_transacao	\N	\N	2026-04-12 23:27:58.044581+00	1
10649ef3-4359-46e1-9bcf-ba7b15260823	024af6e0c81ba7d1db0c007b6cd0bb3971186315a38a45bf61a1f5b00ff9e380	2026-04-12 23:54:11.425642+00	20260412235411_add_divida_propria	\N	\N	2026-04-12 23:54:11.404674+00	1
caee5c60-71c9-4da7-af8e-c94061bcaac4	fcb5b402830547a46cd021a666f9a20349fc294511a41de0ebb4e0fb5127b989	2026-04-13 00:00:33.575654+00	20260413000033_add_tipo_to_conta_fixa	\N	\N	2026-04-13 00:00:33.57296+00	1
aa13c33f-98a1-447f-adbc-1a482066e917	5a85bd4a79248b80c389c53f8735386ffaf8988fb03bd949782f70878ac5e665	2026-04-14 09:33:32.981504+00	20260414093332_orcamento_categoria_opcional	\N	\N	2026-04-14 09:33:32.973774+00	1
5323cce2-ff47-4c27-9d75-39b4f7ce162a	989d380dd4aa5269a6f5e5e0469fed84da5e52e8b7acc0e4f51e792151063220	2026-04-14 09:59:28.544174+00	20260414095928_transacao_conta_orcamento	\N	\N	2026-04-14 09:59:28.541307+00	1
efd06c09-937c-4be3-901a-edb8d22c0275	e0bcb8b015606574691a616ec1bf0da7c27881d7a76db267bece35feb0418a6b	2026-04-19 14:30:16.316406+00	20260419143016_divida_terceiro_cartao	\N	\N	2026-04-19 14:30:16.302808+00	1
1142acfe-de8e-49f1-ad9e-4e30b9b8b269	3713588ce23ca5d6b8407d0e9b1cfbaa0899e7a17dd121049b3d393d1b05f6cb	2026-04-19 19:09:38.38529+00	20260419190938_divida_terceiro_grupo	\N	\N	2026-04-19 19:09:38.382767+00	1
6bfce0a6-921f-49bf-8aa0-c1aa23d9c765	8247e6ba709f4205fc4279ef8590ab056479974c07b4e5182a6b5896651fea1a	2026-04-20 23:56:38.655154+00	20260420235638_add_data_inicio_conta_fixa	\N	\N	2026-04-20 23:56:38.652335+00	1
\.


--
-- Data for Name: alertas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alertas (id, tipo, mensagem, lido, enviado, "createdAt", "userId") FROM stdin;
\.


--
-- Data for Name: cartoes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cartoes (id, nome, bandeira, limite, "diaFechamento", "diaVencimento", cor, ativo, "createdAt", "userId") FROM stdin;
cmnunhc7c00071zmmntub3e5e	Nubank Fisica	Mastercard	1600	2	9	#2563eb	t	2026-04-11 18:10:29.256	cmnum8pui000037p8x9fwhlqj
cmnuuqlav00471lmmtgtwx5m1	Santander	Mastercard	22120	5	9	#dc2626	t	2026-04-11 21:33:38.263	cmnum8pui000037p8x9fwhlqj
cmnumvklh00041zmm0z2b1nyh	Nunbank PJ	Mastercard	17550	1	2	#7c3aed	t	2026-04-11 17:53:33.701	cmnum8pui000037p8x9fwhlqj
cmnun7a5200061zmmdc95to1d	C6	Mastercard	6000	1	5	#374151	t	2026-04-11 18:02:40.022	cmnum8pui000037p8x9fwhlqj
\.


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categorias (id, nome, tipo, icone, cor, ativo, "createdAt", "userId") FROM stdin;
cmnuo5dt8000o1zmml3nfzyt2	Pessoal	SAIDA			t	2026-04-11 18:29:11.084	cmnum8pui000037p8x9fwhlqj
cmnwe0j9y00001lmmkj2usiwc	Fixo	SAIDA			t	2026-04-12 23:21:01.079	cmnum8pui000037p8x9fwhlqj
cmnumi3ke00001zmmjnunoenn	Animais	SAIDA	🐶	#fb7185	t	2026-04-11 17:43:05.102	cmnum8pui000037p8x9fwhlqj
cmnuookln001f1zmmo3a3g9u9	Casa	SAIDA	🏡	#facc15	t	2026-04-11 18:44:06.347	cmnum8pui000037p8x9fwhlqj
cmnwe6k2100031lmmtbt0dzzj	Saúde	SAIDA	🏥	#9ca3af	t	2026-04-12 23:25:42.025	cmnum8pui000037p8x9fwhlqj
cmnumonnl00031zmmg3v4zqc0	Supermercado	SAIDA	🛒	#facc15	t	2026-04-11 17:48:11.073	cmnum8pui000037p8x9fwhlqj
cmnup4aqw001y1zmm7m6x0x38	Alimentação Fora	SAIDA	🥩	#dc2626	t	2026-04-11 18:56:20.072	cmnum8pui000037p8x9fwhlqj
cmnurd4rb00151lmmagl7wupd	Delivery	SAIDA	🍔	#facc15	t	2026-04-11 19:59:11.447	cmnum8pui000037p8x9fwhlqj
cmo65s7sl00091lmmgmxmg142	Roupas	SAIDA	🧥	#22d3ee	t	2026-04-19 19:28:17.781	cmnum8pui000037p8x9fwhlqj
cmnwfpv8500041lmm0ypzc34u	Empresa	SAIDA	🏢	#a3e635	t	2026-04-13 00:08:42.581	cmnum8pui000037p8x9fwhlqj
cmnuppkjx00241zmmb9okvy8y	Assinaturas	SAIDA	✏️	#db2777	t	2026-04-11 19:12:52.557	cmnum8pui000037p8x9fwhlqj
cmnurbqkb00131lmmq6bckgw4	Farmacia	SAIDA	💊	#7c3aed	t	2026-04-11 19:58:06.395	cmnum8pui000037p8x9fwhlqj
cmnunqni0000g1zmminezkdjc	Outros	SAIDA	💸	#a16207	t	2026-04-11 18:17:43.8	cmnum8pui000037p8x9fwhlqj
cmnurb04500111lmmy92gwr6z	Uber	SAIDA	🚗	#374151	t	2026-04-11 19:57:32.117	cmnum8pui000037p8x9fwhlqj
cmnupctdm00221zmm0mhhkb70	Carro	SAIDA	🏎️	#111827	t	2026-04-11 19:02:57.466	cmnum8pui000037p8x9fwhlqj
cmnuv4idm004l1lmmya52y1e2	Divida Terceiros	SAIDA	💰	#f59e0b	t	2026-04-11 21:44:27.658	cmnum8pui000037p8x9fwhlqj
cmnumiel600011zmm00qq52oz	Salario	ENTRADA	🤑	#16a34a	t	2026-04-11 17:43:19.386	cmnum8pui000037p8x9fwhlqj
cmnursscm001p1lmmjyxk19e9	Estudos	SAIDA	🖥️	#c026d3	t	2026-04-11 20:11:21.862	cmnum8pui000037p8x9fwhlqj
cmnuo20et000n1zmmalwilgy0	Eletrônicos	SAIDA	🎮		t	2026-04-11 18:26:33.749	cmnum8pui000037p8x9fwhlqj
cmnuns9ap000h1zmm9we1c76s	Beleza	SAIDA	💅	#fb7185	t	2026-04-11 18:18:58.705	cmnum8pui000037p8x9fwhlqj
\.


--
-- Data for Name: contas_fixas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contas_fixas (id, descricao, valor, "diaVencimento", recorrente, ativo, "createdAt", "userId", "categoriaId", tipo, "dataInicio") FROM stdin;
cmnwe32ym00021lmmfrq9ywgm	Financiamento carro	2563.09	2	t	t	2026-04-12 23:22:59.902	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	SAIDA	\N
cmnwe6z7500041lmmh82udj5o	Convênio medico	1255.06	5	t	t	2026-04-12 23:26:01.649	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	SAIDA	\N
cmnwe7zlo00051lmmtfv9bfi3	Convênio odontologico	114	23	t	t	2026-04-12 23:26:48.828	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	SAIDA	\N
cmnwek1k000031lmmz4x3vrck	Internet	229	5	t	t	2026-04-12 23:36:11.232	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	SAIDA	\N
cmnwejg2000021lmmanuasbzd	Faxineira	250	15	t	t	2026-04-12 23:35:43.368	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	SAIDA	\N
cmnwel1n800051lmmv8ig9436	Estacionamento	180	20	t	t	2026-04-12 23:36:58.004	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	SAIDA	\N
cmnwerhkb00061lmm48yn067m	Luz	350	13	t	t	2026-04-12 23:41:58.571	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	SAIDA	\N
cmnwet5zo00071lmmnpkxr1dp	Água	250	10	t	t	2026-04-12 23:43:16.884	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	SAIDA	\N
cmnwexq7p000a1lmmje7i48uq	Sky +	189.9	27	t	t	2026-04-12 23:46:49.717	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	SAIDA	\N
cmnwfmmvm00001lmm5y3if0gx	Sálario	23250	30	t	t	2026-04-13 00:06:11.794	cmnum8pui000037p8x9fwhlqj	cmnumiel600011zmm00qq52oz	ENTRADA	\N
cmnwfny8y00011lmm25j5v6dq	Sálario Rei dos Queijos	1000	10	t	t	2026-04-13 00:07:13.186	cmnum8pui000037p8x9fwhlqj	cmnumiel600011zmm00qq52oz	ENTRADA	\N
cmnwg7a4c00071lmm3c2bwr7h	Aluguel	3697.46	20	t	t	2026-04-13 00:22:15.036	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	SAIDA	\N
cmo67l20800261lmmunhvkjqk	Empresa - Prolabore	178.31	20	t	t	2026-04-19 20:18:42.92	cmnum8pui000037p8x9fwhlqj	cmnwfpv8500041lmm0ypzc34u	SAIDA	\N
cmo67m6c700271lmm48i22uv8	Empresa - Imposto	1498.05	20	t	t	2026-04-19 20:19:35.191	cmnum8pui000037p8x9fwhlqj	cmnwfpv8500041lmm0ypzc34u	SAIDA	\N
cmo67nh8700281lmmi5k86aon	Empresa - Parcelamento DAS	70.91	20	t	t	2026-04-19 20:20:35.96	cmnum8pui000037p8x9fwhlqj	cmnwfpv8500041lmm0ypzc34u	SAIDA	\N
cmo67nw8m00291lmmaomyxttv	Empresa Ricardo	150	20	t	t	2026-04-19 20:20:55.414	cmnum8pui000037p8x9fwhlqj	cmnwfpv8500041lmm0ypzc34u	SAIDA	\N
cmo7pom66002f1lmmn84xp7oq	Salário Radiologia	2000	10	t	t	2026-04-20 21:33:08.286	cmnum8pui000037p8x9fwhlqj	cmnumiel600011zmm00qq52oz	ENTRADA	2026-05-01 03:00:00
\.


--
-- Data for Name: dividas_proprias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dividas_proprias (id, credor, descricao, "valorTotal", parcelas, vencimento, status, "createdAt", "updatedAt", "userId") FROM stdin;
cmnwfrqr800051lmmigi7nvk9	Janaina	Eudora	155.81	\N	2026-04-20 00:00:00	QUITADA	2026-04-13 00:10:10.1	2026-04-26 23:11:55.838	cmnum8pui000037p8x9fwhlqj
\.


--
-- Data for Name: dividas_terceiros; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dividas_terceiros (id, "nomeDevedor", descricao, "valorTotal", "valorRecebido", vencimento, status, "createdAt", "updatedAt", "userId", "cartaoId", "formaPagamento", grupo) FROM stdin;
cmo7egtzx001e1lmmiow8fe65	Inês	Parcela 5/5	331.3	0	2026-08-20 15:31:42.333	ABERTA	2026-04-20 16:19:09.405	2026-04-20 16:19:09.405	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Sofá
cmo65dzgi00021lmmdoqu6mqq	Inês	Parcela 2/2	274.94	0	2026-05-19 19:16:42.483	ABERTA	2026-04-19 19:17:13.794	2026-04-19 20:46:31.163	cmnum8pui000037p8x9fwhlqj	cmnun7a5200061zmmdc95to1d	CREDITO	Páscoa
cmo65dzfw00001lmmwb1l91gj	Inês	Parcela 1/2	274.94	0	2026-04-19 19:16:42.483	ABERTA	2026-04-19 19:17:13.773	2026-04-19 20:49:53.895	cmnum8pui000037p8x9fwhlqj	cmnun7a5200061zmmdc95to1d	CREDITO	Páscoa
cmo7ctzt9000i1lmmlxl3m1yz	Eduardo	Parcela 1/8	288.37	0	2026-04-20 15:31:42.333	ABERTA	2026-04-20 15:33:24.237	2026-04-20 15:33:24.237	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Emprestimo
cmo7ctztq000k1lmm7ft0tdyx	Eduardo	Parcela 2/8	288.37	0	2026-05-20 15:31:42.333	ABERTA	2026-04-20 15:33:24.254	2026-04-20 15:33:24.254	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Emprestimo
cmo7ctztw000m1lmml9clf4ez	Eduardo	Parcela 3/8	288.37	0	2026-06-20 15:31:42.333	ABERTA	2026-04-20 15:33:24.26	2026-04-20 15:33:24.26	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Emprestimo
cmo7ctzu1000o1lmm2asu89j4	Eduardo	Parcela 4/8	288.37	0	2026-07-20 15:31:42.333	ABERTA	2026-04-20 15:33:24.265	2026-04-20 15:33:24.265	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Emprestimo
cmo7ctzu7000q1lmmaulxbd8a	Eduardo	Parcela 5/8	288.37	0	2026-08-20 15:31:42.333	ABERTA	2026-04-20 15:33:24.271	2026-04-20 15:33:24.271	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Emprestimo
cmo7ctzud000s1lmm8s73pn6j	Eduardo	Parcela 6/8	288.37	0	2026-09-20 15:31:42.333	ABERTA	2026-04-20 15:33:24.277	2026-04-20 15:33:24.277	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Emprestimo
cmo7ctzuk000u1lmmzjo795wq	Eduardo	Parcela 7/8	288.37	0	2026-10-20 15:31:42.333	ABERTA	2026-04-20 15:33:24.284	2026-04-20 15:33:24.284	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Emprestimo
cmo7ctzup000w1lmmw3piissv	Eduardo	Parcela 8/8	288.37	0	2026-11-20 15:31:42.333	ABERTA	2026-04-20 15:33:24.289	2026-04-20 15:33:24.289	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Emprestimo
cmo7egtzi00181lmm3236l833	Inês	Parcela 2/5	331.3	0	2026-05-20 15:31:42.333	ABERTA	2026-04-20 16:19:09.39	2026-04-20 16:19:09.39	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Sofá
cmo7egtzn001a1lmmbbsa4aze	Inês	Parcela 3/5	331.3	0	2026-06-20 15:31:42.333	ABERTA	2026-04-20 16:19:09.395	2026-04-20 16:19:09.395	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Sofá
cmo7egtzs001c1lmm3137e6yz	Inês	Parcela 4/5	331.3	0	2026-07-20 15:31:42.333	ABERTA	2026-04-20 16:19:09.4	2026-04-20 16:19:09.4	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Sofá
cmo7arcxg002q1lmmjl26yffc	Eduardo	\N	200	0	2026-04-20 15:00:00	RECEBIDA	2026-04-20 14:35:22.036	2026-04-20 17:01:36.636	cmnum8pui000037p8x9fwhlqj	\N	PIX	\N
cmo7a5mgc002o1lmm0nz3yfzv	Eduardo	\N	1291.05	0	2026-04-20 15:00:00	RECEBIDA	2026-04-20 14:18:27.948	2026-04-20 17:01:39.213	cmnum8pui000037p8x9fwhlqj	\N	PIX	\N
cmo7egtz100161lmmzm08pbxb	Inês	Parcela 1/5	331.3	331.3	2026-04-20 15:31:42.333	RECEBIDA	2026-04-20 16:19:09.373	2026-05-02 19:35:15.14	cmnum8pui000037p8x9fwhlqj	cmnuuqlav00471lmmtgtwx5m1	CREDITO	Sofá
cmooqxdt6001c1loghlx5izob	Eduardo	\N	1150	0	2026-05-20 15:00:00	ABERTA	2026-05-02 19:40:01.962	2026-05-02 19:40:01.962	cmnum8pui000037p8x9fwhlqj	\N	PIX	Emprestado
\.


--
-- Data for Name: metas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.metas (id, nome, descricao, "valorObjetivo", "valorAtual", "aportesMensal", "prazoEstimado", icone, ativo, "createdAt", "updatedAt", "userId") FROM stdin;
cmo7wgeee00001lmmj2t3blyj	Casamento		100000	0	\N	2028-04-22 00:00:00		t	2026-04-21 00:42:42.278	2026-04-21 00:42:51.688	cmnum8pui000037p8x9fwhlqj
\.


--
-- Data for Name: orcamentos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orcamentos (id, "valorLimite", "mesAno", "createdAt", "userId", "categoriaId") FROM stdin;
cmo63ekk500001lmmcyaw8sbq	5000	2026-04	2026-04-19 18:21:41.909	cmnum8pui000037p8x9fwhlqj	\N
cmnyfit3800011lmm1352ahzo	5000	2026-05	2026-04-14 09:38:45.572	cmnum8pui000037p8x9fwhlqj	\N
\.


--
-- Data for Name: subcategorias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subcategorias (id, nome, ativo, "categoriaId") FROM stdin;
\.


--
-- Data for Name: transacoes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transacoes (id, descricao, tipo, valor, data, status, "formaPagamento", observacao, origem, "numeroParcela", "totalParcelas", "createdAt", "updatedAt", "userId", "categoriaId", "subcategoriaId", "cartaoId", "dividaId", recorrente, "contaFixaId", "dividaPropiaId", "contaOrcamento") FROM stdin;
cmnxtao44000x1lmmolm85o14	Monitor	SAIDA	109.4	2026-04-13 15:00:00	PARCELADO	CREDITO	Mercado Livre	MANUAL	9	10	2026-04-13 23:16:34.324	2026-04-13 23:16:34.324	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxtao44000y1lmm39xoo3tm	Monitor	SAIDA	109.4	2026-05-13 15:00:00	PARCELADO	CREDITO	Mercado Livre	MANUAL	10	10	2026-04-13 23:16:34.324	2026-04-13 23:16:34.324	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwfbz100261lmmfgebdh4m	Apple	SAIDA	9.99	2026-11-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:10.716	2026-04-14 00:44:10.716	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfbz100271lmm44dmf659	Apple	SAIDA	9.99	2026-12-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:10.716	2026-04-14 00:44:10.716	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfbz100281lmmgm3ckq0i	Apple	SAIDA	9.99	2027-01-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:10.716	2026-04-14 00:44:10.716	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfbz100291lmmku64k4nu	Apple	SAIDA	9.99	2027-02-28 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:10.716	2026-04-14 00:44:10.716	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfbz1002a1lmm6whne98t	Apple	SAIDA	9.99	2027-03-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:10.716	2026-04-14 00:44:10.716	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwnfo400301lmmg0jw0lpp	Zara	SAIDA	223.5	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	5	2026-04-14 00:50:28.756	2026-04-14 00:50:28.756	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwnfo400311lmmwkzdd2mj	Zara	SAIDA	223.5	2026-05-13 15:00:00	PARCELADO	CREDITO		MANUAL	2	5	2026-04-14 00:50:28.756	2026-04-14 00:50:28.756	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwnfo400321lmmdz4oha7x	Zara	SAIDA	223.5	2026-06-13 15:00:00	PARCELADO	CREDITO		MANUAL	3	5	2026-04-14 00:50:28.756	2026-04-14 00:50:28.756	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwnfo400331lmm06il7pbb	Zara	SAIDA	223.5	2026-07-13 15:00:00	PARCELADO	CREDITO		MANUAL	4	5	2026-04-14 00:50:28.756	2026-04-14 00:50:28.756	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwnfo400341lmmo30x4w0h	Zara	SAIDA	223.5	2026-08-13 15:00:00	PARCELADO	CREDITO		MANUAL	5	5	2026-04-14 00:50:28.756	2026-04-14 00:50:28.756	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwqqrw00391lmmxqujxxtx	Shoope	SAIDA	134.25	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:53:03.116	2026-04-14 00:53:03.116	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwuwuk003e1lmmwvz86pvt	Convenio Fred	SAIDA	24.43	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:56:17.612	2026-04-14 00:56:17.612	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwuwuk003f1lmm6va5xbdj	Convenio Fred	SAIDA	24.43	2026-05-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:56:17.612	2026-04-14 00:56:17.612	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwuwuk003g1lmmr0e52rrn	Convenio Fred	SAIDA	24.43	2026-06-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:56:17.612	2026-04-14 00:56:17.612	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwuwuk003h1lmmjur7u1xw	Convenio Fred	SAIDA	24.43	2026-07-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:56:17.612	2026-04-14 00:56:17.612	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwuwul003i1lmmpnxudzlm	Convenio Fred	SAIDA	24.43	2026-08-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:56:17.612	2026-04-14 00:56:17.612	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwuwul003j1lmmn1ckgcr0	Convenio Fred	SAIDA	24.43	2026-09-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:56:17.612	2026-04-14 00:56:17.612	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwuwul003k1lmmki0zswfj	Convenio Fred	SAIDA	24.43	2026-10-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:56:17.612	2026-04-14 00:56:17.612	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwuwul003l1lmmsxxudbqh	Convenio Fred	SAIDA	24.43	2026-11-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:56:17.612	2026-04-14 00:56:17.612	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwuwul003m1lmmfikdkel3	Convenio Fred	SAIDA	24.43	2026-12-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:56:17.612	2026-04-14 00:56:17.612	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwuwul003n1lmmo7l7dxe5	Convenio Fred	SAIDA	24.43	2027-01-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:56:17.612	2026-04-14 00:56:17.612	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwuwul003o1lmmvej1zoxe	Convenio Fred	SAIDA	24.43	2027-02-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:56:17.612	2026-04-14 00:56:17.612	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwuwul003p1lmmwp9wf59a	Convenio Fred	SAIDA	24.43	2027-03-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:56:17.612	2026-04-14 00:56:17.612	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx0lqw00461lmm3dz342tk	Convenio Lili	SAIDA	33.69	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:43.16	2026-04-14 01:00:43.16	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx0lqw00471lmmp08hy3bc	Convenio Lili	SAIDA	33.69	2026-05-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:43.16	2026-04-14 01:00:43.16	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx0lqw00481lmmbs4mebw4	Convenio Lili	SAIDA	33.69	2026-06-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:43.16	2026-04-14 01:00:43.16	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx0lqw00491lmmttrj6ke3	Convenio Lili	SAIDA	33.69	2026-07-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:43.16	2026-04-14 01:00:43.16	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx0lqw004a1lmmnfsr60np	Convenio Lili	SAIDA	33.69	2026-08-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:43.16	2026-04-14 01:00:43.16	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwbqvq001j1lmm78mtl2dd	Ki file	SAIDA	6	2026-04-27 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:41:23.414	2026-04-19 18:20:54.766	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwkg2f002v1lmm90wzyqvi	99 food	SAIDA	24.94	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:48:09.303	2026-04-19 18:22:19.349	cmnum8pui000037p8x9fwhlqj	cmnurd4rb00151lmmagl7wupd	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwidlq002q1lmm98ppki6p	Gasolina	SAIDA	100	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:46:32.798	2026-04-19 18:33:22.249	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxtdki8000z1lmmprrq4cog	Caminha Cachorras	SAIDA	127.86	2026-04-26 15:00:00	PARCELADO	CREDITO	Shoope	MANUAL	2	3	2026-04-13 23:18:49.616	2026-04-13 23:18:49.616	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxtdki800101lmmq0cs5c7y	Caminha Cachorras	SAIDA	127.88	2026-05-26 15:00:00	PARCELADO	CREDITO	Shoope	MANUAL	3	3	2026-04-13 23:18:49.616	2026-04-13 23:18:49.616	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwfu5w002b1lmmnhk2u1f2	Apple	SAIDA	5.9	2026-04-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:34.292	2026-04-14 00:44:34.292	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfu5w002c1lmmpebjxql0	Apple	SAIDA	5.9	2026-05-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:34.292	2026-04-14 00:44:34.292	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfu5w002d1lmmwwabtds1	Apple	SAIDA	5.9	2026-06-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:34.292	2026-04-14 00:44:34.292	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfu5w002e1lmmzwgp57qt	Apple	SAIDA	5.9	2026-07-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:34.292	2026-04-14 00:44:34.292	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfu5w002f1lmmt0dimre3	Apple	SAIDA	5.9	2026-08-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:34.292	2026-04-14 00:44:34.292	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfu5w002g1lmmnc0g554r	Apple	SAIDA	5.9	2026-09-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:34.292	2026-04-14 00:44:34.292	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfu5w002h1lmm7kr856vs	Apple	SAIDA	5.9	2026-10-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:34.292	2026-04-14 00:44:34.292	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfu5w002i1lmmjoephh2i	Apple	SAIDA	5.9	2026-11-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:34.292	2026-04-14 00:44:34.292	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfu5x002j1lmmcz7ssqb2	Apple	SAIDA	5.9	2026-12-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:34.292	2026-04-14 00:44:34.292	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfu5x002k1lmmfizixayd	Apple	SAIDA	5.9	2027-01-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:34.292	2026-04-14 00:44:34.292	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfu5x002l1lmmoroomc2v	Apple	SAIDA	5.9	2027-02-28 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:34.292	2026-04-14 00:44:34.292	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfu5x002m1lmmghvzlqay	Apple	SAIDA	5.9	2027-03-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:34.292	2026-04-14 00:44:34.292	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwogzc00351lmmo9op44px	Shoope	SAIDA	253.89	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:51:17.112	2026-04-14 00:51:17.112	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxx0lqw004b1lmmaum5ed1q	Convenio Lili	SAIDA	33.69	2026-09-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:43.16	2026-04-14 01:00:43.16	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx0lqw004c1lmm6j7kz8nj	Convenio Lili	SAIDA	33.69	2026-10-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:43.16	2026-04-14 01:00:43.16	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx0lqx004d1lmmtgiuek2m	Convenio Lili	SAIDA	33.69	2026-11-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:43.16	2026-04-14 01:00:43.16	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx0lqx004e1lmm41c2dx58	Convenio Lili	SAIDA	33.69	2026-12-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:43.16	2026-04-14 01:00:43.16	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx0lqx004f1lmmfkesve12	Convenio Lili	SAIDA	33.69	2027-01-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:43.16	2026-04-14 01:00:43.16	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx0lqx004g1lmmsbooy0a1	Convenio Lili	SAIDA	33.69	2027-02-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:43.16	2026-04-14 01:00:43.16	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx0lqx004h1lmmq5ciqp61	Convenio Lili	SAIDA	33.69	2027-03-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:43.16	2026-04-14 01:00:43.16	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx28yv00501lmmp8sdmbt9	Convenio Estela	SAIDA	41.67	2026-09-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:59.911	2026-04-14 01:01:59.911	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx28yv00511lmmyc667yu9	Convenio Estela	SAIDA	41.67	2026-10-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:59.911	2026-04-14 01:01:59.911	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx28yv00521lmmpqm1pmzd	Convenio Estela	SAIDA	41.67	2026-11-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:59.911	2026-04-14 01:01:59.911	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx28yv00531lmm5q4gkxvs	Convenio Estela	SAIDA	41.67	2026-12-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:59.911	2026-04-14 01:01:59.911	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx28yv00541lmm0zc9wre6	Convenio Estela	SAIDA	41.67	2027-01-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:59.911	2026-04-14 01:01:59.911	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwd145001k1lmmis87l9d0	Restaurante	SAIDA	16	2026-04-28 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:42:23.333	2026-04-19 18:21:49.639	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwlhmd002w1lmmtiwbm93w	Animais Sol	SAIDA	354.3	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:48:57.973	2026-04-19 18:22:25.251	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwr1b2003a1lmm32de1qrk	Animais	SAIDA	314.89	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:53:16.766	2026-04-19 18:22:50.448	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwycti003q1lmmjuey7rkj	Cabeleireiro	SAIDA	150	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	2	2026-04-14 00:58:58.279	2026-04-19 18:22:59.085	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwyctj003r1lmm4axlffug	Cabeleireiro	SAIDA	150	2026-05-13 15:00:00	PARCELADO	CREDITO		MANUAL	2	2	2026-04-14 00:58:58.279	2026-04-19 18:23:18.008	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwiufz002r1lmmbnqw17pm	99	SAIDA	15.6	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:46:54.623	2026-04-19 18:35:56.212	cmnum8pui000037p8x9fwhlqj	cmnurb04500111lmmy92gwr6z	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxvyg6q00111lmm7uwo26bd	Guarda Roupa	SAIDA	230.66	2026-04-26 15:00:00	PARCELADO	CREDITO	Mercado Livre	MANUAL	3	10	2026-04-14 00:31:03.026	2026-04-14 00:31:03.026	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxvyg6q00121lmmhnh8eynf	Guarda Roupa	SAIDA	230.66	2026-05-26 15:00:00	PARCELADO	CREDITO	Mercado Livre	MANUAL	4	10	2026-04-14 00:31:03.026	2026-04-14 00:31:03.026	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxvyg6q00131lmmvosnv3gi	Guarda Roupa	SAIDA	230.66	2026-06-26 15:00:00	PARCELADO	CREDITO	Mercado Livre	MANUAL	5	10	2026-04-14 00:31:03.026	2026-04-14 00:31:03.026	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxvyg6q00141lmmpug1lkw5	Guarda Roupa	SAIDA	230.66	2026-07-26 15:00:00	PARCELADO	CREDITO	Mercado Livre	MANUAL	6	10	2026-04-14 00:31:03.026	2026-04-14 00:31:03.026	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxvyg6q00151lmmoh02gw4i	Guarda Roupa	SAIDA	230.66	2026-08-26 15:00:00	PARCELADO	CREDITO	Mercado Livre	MANUAL	7	10	2026-04-14 00:31:03.026	2026-04-14 00:31:03.026	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxvyg6q00161lmme2n75cyu	Guarda Roupa	SAIDA	230.66	2026-09-26 15:00:00	PARCELADO	CREDITO	Mercado Livre	MANUAL	8	10	2026-04-14 00:31:03.026	2026-04-14 00:31:03.026	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxvyg6q00171lmm0d6x5uzt	Guarda Roupa	SAIDA	230.66	2026-10-26 15:00:00	PARCELADO	CREDITO	Mercado Livre	MANUAL	9	10	2026-04-14 00:31:03.026	2026-04-14 00:31:03.026	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxvyg6q00181lmmzsqdrgau	Guarda Roupa	SAIDA	230.66	2026-11-26 15:00:00	PARCELADO	CREDITO	Mercado Livre	MANUAL	10	10	2026-04-14 00:31:03.026	2026-04-14 00:31:03.026	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwotdu00361lmmetlavahm	Shoope	SAIDA	127.79	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:51:33.186	2026-04-14 00:51:33.186	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwreez003b1lmmw359wa7n	Pagamento fatura Nunbank PJ	ENTRADA	1000	2026-04-07 15:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-14 00:53:33.755	2026-04-14 00:53:33.755	cmnum8pui000037p8x9fwhlqj	\N	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxx12n1004i1lmm6qduc50h	Convenio Sky	SAIDA	73.76	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:05.053	2026-04-14 01:01:05.053	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx12n1004j1lmmmrz5rkto	Convenio Sky	SAIDA	73.76	2026-05-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:05.053	2026-04-14 01:01:05.053	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx12n1004k1lmmvxncjrwx	Convenio Sky	SAIDA	73.76	2026-06-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:05.053	2026-04-14 01:01:05.053	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx12n2004l1lmmmxo8ivgs	Convenio Sky	SAIDA	73.76	2026-07-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:05.053	2026-04-14 01:01:05.053	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx12n2004m1lmmw2f3ci6t	Convenio Sky	SAIDA	73.76	2026-08-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:05.053	2026-04-14 01:01:05.053	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx12n2004n1lmmet1g2dwp	Convenio Sky	SAIDA	73.76	2026-09-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:05.053	2026-04-14 01:01:05.053	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx12n2004o1lmmi9mq2jbc	Convenio Sky	SAIDA	73.76	2026-10-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:05.053	2026-04-14 01:01:05.053	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx12n2004p1lmmdxpxzt4u	Convenio Sky	SAIDA	73.76	2026-11-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:05.053	2026-04-14 01:01:05.053	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx12n2004q1lmmrx4iql0a	Convenio Sky	SAIDA	73.76	2026-12-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:05.053	2026-04-14 01:01:05.053	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx12n2004r1lmmbx6lkkof	Convenio Sky	SAIDA	73.76	2027-01-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:05.053	2026-04-14 01:01:05.053	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx12n2004s1lmmmpsbg3fe	Convenio Sky	SAIDA	73.76	2027-02-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:05.053	2026-04-14 01:01:05.053	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx12n2004t1lmmtkxegxan	Convenio Sky	SAIDA	73.76	2027-03-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:05.053	2026-04-14 01:01:05.053	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx28yv00551lmmatm62vnl	Convenio Estela	SAIDA	41.67	2027-02-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:59.911	2026-04-14 01:01:59.911	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx28yv00561lmmrjjbk1c6	Convenio Estela	SAIDA	41.67	2027-03-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:59.911	2026-04-14 01:01:59.911	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx66th005k1lmmnjlxqj7d	PHP storm	SAIDA	34.26	2026-05-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:03.749	2026-04-14 01:05:03.749	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx66th005l1lmm9nsdikoj	PHP storm	SAIDA	34.26	2026-06-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:03.749	2026-04-14 01:05:03.749	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx66th005m1lmmc1ngrn8p	PHP storm	SAIDA	34.26	2026-07-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:03.749	2026-04-14 01:05:03.749	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx66th005n1lmm4t55qa35	PHP storm	SAIDA	34.26	2026-08-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:03.749	2026-04-14 01:05:03.749	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx66th005o1lmm4ifpfdep	PHP storm	SAIDA	34.26	2026-09-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:03.749	2026-04-14 01:05:03.749	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwdixa001l1lmmszeotzxq	Bigchopp	SAIDA	40	2026-04-28 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:42:46.414	2026-04-19 18:21:50.818	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwltfe002x1lmmjejyhgsd	Ração cachorras	SAIDA	557.52	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:49:13.274	2026-04-19 18:22:26.599	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwyrvx003s1lmm085znfl4	Drogasil	SAIDA	16.18	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:59:17.805	2026-04-19 18:35:01.851	cmnum8pui000037p8x9fwhlqj	cmnurbqkb00131lmmq6bckgw4	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwh3vd002n1lmm7z1b1ocx	Uber	SAIDA	19.94	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:45:33.529	2026-04-19 18:35:54.751	cmnum8pui000037p8x9fwhlqj	cmnurb04500111lmmy92gwr6z	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwjbb1002s1lmmuv470wd8	Uber	SAIDA	17.830000000000002	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:47:16.477	2026-04-19 18:35:57.147	cmnum8pui000037p8x9fwhlqj	cmnurb04500111lmmy92gwr6z	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxx66th005j1lmmki3dwudb	PHP storm	SAIDA	33.95	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:03.749	2026-04-19 18:52:59.319	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxt3m90000j1lmmrw6u9exa	Valor total abril	SAIDA	5701.51	2026-03-26 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-13 23:11:05.317	2026-04-13 23:11:05.317	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwe3kh001m1lmm9oq0nsg1	Netflix	SAIDA	44.9	2026-04-29 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:43:13.169	2026-04-14 00:43:13.169	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwe3kh001n1lmma5oo5h79	Netflix	SAIDA	44.9	2026-05-29 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:43:13.169	2026-04-14 00:43:13.169	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwe3kh001o1lmmhqntsdge	Netflix	SAIDA	44.9	2026-06-29 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:43:13.169	2026-04-14 00:43:13.169	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwe3kh001p1lmmle6fx7po	Netflix	SAIDA	44.9	2026-07-29 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:43:13.169	2026-04-14 00:43:13.169	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwe3kh001q1lmm5jd6jcs9	Netflix	SAIDA	44.9	2026-08-29 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:43:13.169	2026-04-14 00:43:13.169	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwe3kh001r1lmmxbwwfhit	Netflix	SAIDA	44.9	2026-09-29 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:43:13.169	2026-04-14 00:43:13.169	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwe3kh001s1lmmd0ou8ukm	Netflix	SAIDA	44.9	2026-10-29 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:43:13.169	2026-04-14 00:43:13.169	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwe3kh001t1lmmcewksbtf	Netflix	SAIDA	44.9	2026-11-29 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:43:13.169	2026-04-14 00:43:13.169	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwe3kh001u1lmmakycvdil	Netflix	SAIDA	44.9	2026-12-29 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:43:13.169	2026-04-14 00:43:13.169	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwe3kh001v1lmmlydpuku0	Netflix	SAIDA	44.9	2027-01-29 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:43:13.169	2026-04-14 00:43:13.169	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwe3kh001w1lmm6gui4g67	Netflix	SAIDA	44.9	2027-02-28 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:43:13.169	2026-04-14 00:43:13.169	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwe3ki001x1lmm4cpecq08	Netflix	SAIDA	44.9	2027-03-29 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:43:13.169	2026-04-14 00:43:13.169	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwm7i8002y1lmmy1jidfqt	Shoope	SAIDA	142.62	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:49:31.52	2026-04-14 00:49:31.52	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwp4e600371lmmte6tcx7r	Mercado Livre	SAIDA	439.82	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:51:47.454	2026-04-14 00:51:47.454	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwrw62003c1lmmcyb6qj4s	Mercado Livre	SAIDA	135.69	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:53:56.762	2026-04-14 00:53:56.762	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwzg7g003t1lmmwmm8zbuk	Sem parar - pedágio	SAIDA	117.98	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:59:49.324	2026-04-14 00:59:49.324	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxx2re900571lmmblelhjkn	Convenio Zoe	SAIDA	37.51	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:02:23.793	2026-04-14 01:02:23.793	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx2re900581lmmofl2z8g3	Convenio Zoe	SAIDA	37.51	2026-05-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:02:23.793	2026-04-14 01:02:23.793	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx2re900591lmm87dmhsx8	Convenio Zoe	SAIDA	37.51	2026-06-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:02:23.793	2026-04-14 01:02:23.793	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx2re9005a1lmmbxqexv5j	Convenio Zoe	SAIDA	37.51	2026-07-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:02:23.793	2026-04-14 01:02:23.793	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx2re9005b1lmmkg46ov6o	Convenio Zoe	SAIDA	37.51	2026-08-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:02:23.793	2026-04-14 01:02:23.793	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx2re9005c1lmme4z6uk78	Convenio Zoe	SAIDA	37.51	2026-09-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:02:23.793	2026-04-14 01:02:23.793	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx2re9005d1lmmtf3h31mt	Convenio Zoe	SAIDA	37.51	2026-10-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:02:23.793	2026-04-14 01:02:23.793	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx2re9005e1lmm3xzy6nko	Convenio Zoe	SAIDA	37.51	2026-11-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:02:23.793	2026-04-14 01:02:23.793	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx2re9005f1lmmh1qxgguu	Convenio Zoe	SAIDA	37.51	2026-12-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:02:23.793	2026-04-14 01:02:23.793	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx2re9005g1lmmfy6amguk	Convenio Zoe	SAIDA	37.51	2027-01-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:02:23.793	2026-04-14 01:02:23.793	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx2re9005h1lmmtdabibxx	Convenio Zoe	SAIDA	37.51	2027-02-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:02:23.793	2026-04-14 01:02:23.793	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx2re9005i1lmm2soioz6a	Convenio Zoe	SAIDA	37.51	2027-03-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:02:23.793	2026-04-14 01:02:23.793	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx66th005p1lmm9shpj6kg	PHP storm	SAIDA	34.26	2026-10-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:03.749	2026-04-14 01:05:03.749	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx66th005q1lmmzo9lfpoo	PHP storm	SAIDA	34.26	2026-11-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:03.749	2026-04-14 01:05:03.749	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx66th005r1lmmi6u1pxfw	PHP storm	SAIDA	34.26	2026-12-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:03.749	2026-04-14 01:05:03.749	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx66th005s1lmm4stb1ybh	PHP storm	SAIDA	34.26	2027-01-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:03.749	2026-04-14 01:05:03.749	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwhoh3002o1lmm1962unan	Keeta	SAIDA	61.38	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:46:00.231	2026-04-19 18:22:07.932	cmnum8pui000037p8x9fwhlqj	cmnurd4rb00151lmmagl7wupd	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwjps5002t1lmmf04rqokx	99	SAIDA	1.56	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:47:35.237	2026-04-19 18:35:58.019	cmnum8pui000037p8x9fwhlqj	cmnurb04500111lmmy92gwr6z	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxt4ooq000m1lmmypuypsrz	Mercado Livre	SAIDA	8.33	2026-06-26 15:00:00	PARCELADO	CREDITO		MANUAL	5	6	2026-04-13 23:11:55.13	2026-04-13 23:11:55.13	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxt4oor000n1lmm7t62b0lk	Mercado Livre	SAIDA	8.33	2026-07-26 15:00:00	PARCELADO	CREDITO		MANUAL	6	6	2026-04-13 23:11:55.13	2026-04-13 23:11:55.13	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxw8wml001b1lmmpx52cnhq	Gás	SAIDA	207.89	2026-04-26 15:00:00	PARCELADO	CREDITO		MANUAL	2	2	2026-04-14 00:39:10.893	2026-04-14 00:39:10.893	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwq5fi00381lmm9xwwpn94	Mercado Livre	SAIDA	140.93	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:52:35.454	2026-04-14 00:52:35.454	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwscrz003d1lmmvhk3nxxv	Faculdade	SAIDA	284.98	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:54:18.287	2026-04-14 00:54:18.287	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxx04ui003u1lmmmycxw2qx	Totalpass	SAIDA	119.9	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:21.258	2026-04-14 01:00:21.258	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx04ui003v1lmmlnrha1pj	Totalpass	SAIDA	119.9	2026-05-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:21.258	2026-04-14 01:00:21.258	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx04ui003w1lmmy6gxrvxg	Totalpass	SAIDA	119.9	2026-06-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:21.258	2026-04-14 01:00:21.258	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx04ui003x1lmmh084xwys	Totalpass	SAIDA	119.9	2026-07-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:21.258	2026-04-14 01:00:21.258	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx04ui003y1lmm78vjmo6u	Totalpass	SAIDA	119.9	2026-08-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:21.258	2026-04-14 01:00:21.258	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx04ui003z1lmmwhhiizpv	Totalpass	SAIDA	119.9	2026-09-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:21.258	2026-04-14 01:00:21.258	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx04uj00401lmm6u3ta3ze	Totalpass	SAIDA	119.9	2026-10-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:21.258	2026-04-14 01:00:21.258	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx04uj00411lmmvj5ljhcv	Totalpass	SAIDA	119.9	2026-11-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:21.258	2026-04-14 01:00:21.258	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx04uj00421lmm4ae9anvo	Totalpass	SAIDA	119.9	2026-12-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:21.258	2026-04-14 01:00:21.258	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx04uj00431lmmrbnk5kat	Totalpass	SAIDA	119.9	2027-01-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:21.258	2026-04-14 01:00:21.258	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx04uj00441lmmn5fftpm1	Totalpass	SAIDA	119.9	2027-02-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:21.258	2026-04-14 01:00:21.258	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx04uj00451lmmbv8npbr5	Totalpass	SAIDA	119.9	2027-03-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:00:21.258	2026-04-14 01:00:21.258	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx28yv004v1lmmwligije3	Convenio Estela	SAIDA	41.67	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:59.911	2026-04-14 01:01:59.911	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx28yv004w1lmmqxb3zc4x	Convenio Estela	SAIDA	41.67	2026-05-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:59.911	2026-04-14 01:01:59.911	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx28yv004x1lmm48vyc0mr	Convenio Estela	SAIDA	41.67	2026-06-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:59.911	2026-04-14 01:01:59.911	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx28yv004y1lmm5b6dsbyb	Convenio Estela	SAIDA	41.67	2026-07-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:59.911	2026-04-14 01:01:59.911	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx28yv004z1lmmf8g4uifk	Convenio Estela	SAIDA	41.67	2026-08-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:01:59.911	2026-04-14 01:01:59.911	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnuuk39500421lmm5i5aeoez	Chili beans	SAIDA	93.32	2026-05-01 15:00:00	PARCELADO	CREDITO		MANUAL	5	9	2026-04-11 21:28:34.937	2026-04-11 21:28:34.937	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnunhc7c00071zmmntub3e5e	\N	f	\N	\N	f
cmnuuk39500431lmmmlc9mscc	Chili beans	SAIDA	93.32	2026-06-01 15:00:00	PARCELADO	CREDITO		MANUAL	6	9	2026-04-11 21:28:34.937	2026-04-11 21:28:34.937	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnunhc7c00071zmmntub3e5e	\N	f	\N	\N	f
cmnuuk39500441lmmq6dibuke	Chili beans	SAIDA	93.32	2026-07-01 15:00:00	PARCELADO	CREDITO		MANUAL	7	9	2026-04-11 21:28:34.937	2026-04-11 21:28:34.937	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnunhc7c00071zmmntub3e5e	\N	f	\N	\N	f
cmnuuk39500451lmmx2m8hjhg	Chili beans	SAIDA	93.32	2026-08-01 15:00:00	PARCELADO	CREDITO		MANUAL	8	9	2026-04-11 21:28:34.937	2026-04-11 21:28:34.937	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnunhc7c00071zmmntub3e5e	\N	f	\N	\N	f
cmnuuk39500461lmmc7eqddgg	Chili beans	SAIDA	93.32	2026-09-01 15:00:00	PARCELADO	CREDITO		MANUAL	9	9	2026-04-11 21:28:34.937	2026-04-11 21:28:34.937	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnunhc7c00071zmmntub3e5e	\N	f	\N	\N	f
cmnuut7tg00491lmmtvy86tz7	Maori	SAIDA	420	2026-04-11 15:00:00	PARCELADO	CREDITO		MANUAL	9	10	2026-04-11 21:35:40.756	2026-04-11 21:36:22.725	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuury6g00481lmmnhiifrwb	Inglês	SAIDA	300.74	2026-04-22 15:00:00	PARCELADO	CREDITO	HublaSpeakac	MANUAL	12	12	2026-04-11 21:34:41.608	2026-04-11 21:36:56.44	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnxwk328002u1lmmgo3qx48e	Gelateria	SAIDA	25	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:47:52.448	2026-04-19 18:22:17.569	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwevwq001y1lmmy6mzt35m	Sem parar (Gasolina)	SAIDA	100	2026-04-29 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:43:49.898	2026-04-19 18:33:21.329	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnuut7tg004a1lmmw25jcsy5	Maori	SAIDA	420	2026-05-11 15:00:00	PARCELADO	CREDITO		MANUAL	10	10	2026-04-11 21:35:40.756	2026-04-11 21:41:12.778	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnxwmig9002z1lmmhdtemdir	Sem parar (Gasolina)	SAIDA	100	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:49:45.705	2026-04-19 18:33:24.41	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnxwi3k2002p1lmm03q17wli	Insulina	SAIDA	47	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:46:19.778	2026-04-19 18:35:06.312	cmnum8pui000037p8x9fwhlqj	cmnurbqkb00131lmmq6bckgw4	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnuv0znv004g1lmmqlvbpkhs	Rei dos Queijos	SAIDA	340.09	2026-05-11 15:00:00	PARCELADO	CREDITO		MANUAL	10	10	2026-04-11 21:41:43.435	2026-04-11 21:41:58.963	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuv0znv004f1lmmb377tp0m	Rei dos Queijos	SAIDA	340.09	2026-04-11 15:00:00	PARCELADO	CREDITO		MANUAL	9	10	2026-04-11 21:41:43.435	2026-04-11 21:42:13.334	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuv2gj2004k1lmmblo665r3	Peugeout	SAIDA	210	2026-07-11 15:00:00	PARCELADO	CREDITO		MANUAL	10	10	2026-04-11 21:42:51.95	2026-04-11 21:43:11.404	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuv2gj2004j1lmmeritwwmj	Peugeout	SAIDA	210	2026-06-11 15:00:00	PARCELADO	CREDITO		MANUAL	9	10	2026-04-11 21:42:51.95	2026-04-11 21:43:18.233	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuv2gj2004i1lmm8svzrof9	Peugeout	SAIDA	210	2026-05-11 15:00:00	PARCELADO	CREDITO		MANUAL	8	10	2026-04-11 21:42:51.95	2026-04-11 21:43:25.087	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuv2gj2004h1lmm9tt02nu1	Peugeout	SAIDA	210	2026-04-11 15:00:00	PARCELADO	CREDITO		MANUAL	7	10	2026-04-11 21:42:51.95	2026-04-11 21:43:31.868	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnxt8vmn000o1lmm04f2lu6a	Mercado Livre	SAIDA	49.98	2026-04-26 15:00:00	PARCELADO	CREDITO		MANUAL	3	6	2026-04-13 23:15:10.751	2026-04-13 23:15:10.751	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxt8vmn000p1lmmzaixwzti	Mercado Livre	SAIDA	49.98	2026-05-26 15:00:00	PARCELADO	CREDITO		MANUAL	4	6	2026-04-13 23:15:10.751	2026-04-13 23:15:10.751	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxt8vmn000q1lmm1zop1frc	Mercado Livre	SAIDA	49.98	2026-06-26 15:00:00	PARCELADO	CREDITO		MANUAL	5	6	2026-04-13 23:15:10.751	2026-04-13 23:15:10.751	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxt8vmn000r1lmmk8ufatqx	Mercado Livre	SAIDA	50	2026-07-26 15:00:00	PARCELADO	CREDITO		MANUAL	6	6	2026-04-13 23:15:10.751	2026-04-13 23:15:10.751	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxw9tqz001c1lmmw8dh3p19	Clube Petlove	SAIDA	2.9	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	7	12	2026-04-14 00:39:53.819	2026-04-14 00:39:53.819	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxw9tqz001d1lmmb6k3dxw5	Clube Petlove	SAIDA	2.9	2026-05-13 15:00:00	PARCELADO	CREDITO		MANUAL	8	12	2026-04-14 00:39:53.819	2026-04-14 00:39:53.819	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxw9tqz001e1lmm72gtl69e	Clube Petlove	SAIDA	2.9	2026-06-13 15:00:00	PARCELADO	CREDITO		MANUAL	9	12	2026-04-14 00:39:53.819	2026-04-14 00:39:53.819	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxw9tr0001f1lmmun2v1kzi	Clube Petlove	SAIDA	2.9	2026-07-13 15:00:00	PARCELADO	CREDITO		MANUAL	10	12	2026-04-14 00:39:53.819	2026-04-14 00:39:53.819	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxw9tr0001g1lmmxyyk08xz	Clube Petlove	SAIDA	2.9	2026-08-13 15:00:00	PARCELADO	CREDITO		MANUAL	11	12	2026-04-14 00:39:53.819	2026-04-14 00:39:53.819	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxw9tr0001h1lmmjly2sxyv	Clube Petlove	SAIDA	2.9	2026-09-13 15:00:00	PARCELADO	CREDITO		MANUAL	12	12	2026-04-14 00:39:53.819	2026-04-14 00:39:53.819	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwfbz0001z1lmm2zrb2isq	Apple	SAIDA	9.99	2026-04-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:10.716	2026-04-14 00:44:10.716	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfbz000201lmmtekgsu33	Apple	SAIDA	9.99	2026-05-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:10.716	2026-04-14 00:44:10.716	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfbz000211lmmaw7e5bqx	Apple	SAIDA	9.99	2026-06-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:10.716	2026-04-14 00:44:10.716	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnuvrogi005h1lmmusoehmh6	Pós Graduação HCX	SAIDA	736.6	2026-04-11 15:00:00	PARCELADO	CREDITO		MANUAL	1	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogi005i1lmmk2lp46lr	Pós Graduação HCX	SAIDA	736.6	2026-05-11 15:00:00	PARCELADO	CREDITO		MANUAL	2	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogi005j1lmmhrj4l8dr	Pós Graduação HCX	SAIDA	736.6	2026-06-11 15:00:00	PARCELADO	CREDITO		MANUAL	3	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogi005k1lmmf65nk3ym	Pós Graduação HCX	SAIDA	736.6	2026-07-11 15:00:00	PARCELADO	CREDITO		MANUAL	4	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogi005l1lmm5w5d34a5	Pós Graduação HCX	SAIDA	736.6	2026-08-11 15:00:00	PARCELADO	CREDITO		MANUAL	5	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogi005m1lmmdij9h1qk	Pós Graduação HCX	SAIDA	736.6	2026-09-11 15:00:00	PARCELADO	CREDITO		MANUAL	6	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogi005n1lmm586wufe2	Pós Graduação HCX	SAIDA	736.6	2026-10-11 15:00:00	PARCELADO	CREDITO		MANUAL	7	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogi005o1lmmw8xqiwe4	Pós Graduação HCX	SAIDA	736.6	2026-11-11 15:00:00	PARCELADO	CREDITO		MANUAL	8	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogj005p1lmmgjofw85l	Pós Graduação HCX	SAIDA	736.6	2026-12-11 15:00:00	PARCELADO	CREDITO		MANUAL	9	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogj005q1lmmzaom2k85	Pós Graduação HCX	SAIDA	736.6	2027-01-11 15:00:00	PARCELADO	CREDITO		MANUAL	10	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogj005r1lmme7drnbbh	Pós Graduação HCX	SAIDA	736.6	2027-02-11 15:00:00	PARCELADO	CREDITO		MANUAL	11	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogj005s1lmm8r3ph5cd	Pós Graduação HCX	SAIDA	736.6	2027-03-11 15:00:00	PARCELADO	CREDITO		MANUAL	12	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogj005t1lmmn4c61uz5	Pós Graduação HCX	SAIDA	736.6	2027-04-11 15:00:00	PARCELADO	CREDITO		MANUAL	13	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogj005u1lmmaqwrobr0	Pós Graduação HCX	SAIDA	736.6	2027-05-11 15:00:00	PARCELADO	CREDITO		MANUAL	14	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvrogj005v1lmm3h29eepj	Pós Graduação HCX	SAIDA	736.6	2027-06-11 15:00:00	PARCELADO	CREDITO		MANUAL	15	15	2026-04-11 22:02:28.626	2026-04-11 22:02:28.626	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvpuan005g1lmmooq35jkl	Ec2 produtos	SAIDA	69.4	2026-05-11 15:00:00	PARCELADO	CREDITO		MANUAL	12	12	2026-04-11 22:01:02.879	2026-04-11 22:03:23.163	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnuvpuan005f1lmmhx6ydccg	Ec2 produtos	SAIDA	69.4	2026-04-11 15:00:00	PARCELADO	CREDITO		MANUAL	11	12	2026-04-11 22:01:02.879	2026-04-11 22:03:33.958	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnween2100001lmml1brt8r6	Financiamento carro	SAIDA	2563.09	2026-04-02 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-12 23:31:59.161	2026-04-12 23:31:59.161	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	\N	\N	f	cmnwe32ym00021lmmfrq9ywgm	\N	f
cmnweepav00011lmmqhaa67zm	Convênio medico	SAIDA	1255.06	2026-04-05 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-12 23:32:02.071	2026-04-12 23:32:02.071	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	\N	\N	f	cmnwe6z7500041lmmh82udj5o	\N	f
cmnwek7b400041lmmnorxpxgt	Internet	SAIDA	229	2026-04-05 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-12 23:36:18.689	2026-04-12 23:36:18.689	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	\N	\N	f	cmnwek1k000031lmmz4x3vrck	\N	f
cmnwetixm00081lmmetfy9twt	Água	SAIDA	230.88	2026-04-10 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-12 23:43:33.658	2026-04-12 23:43:33.658	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	\N	\N	f	cmnwet5zo00071lmmnpkxr1dp	\N	f
cmnwewf1400091lmm1xh6me6r	Luz	SAIDA	250.92	2026-04-13 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-12 23:45:48.568	2026-04-12 23:45:48.568	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	\N	\N	f	cmnwerhkb00061lmm48yn067m	\N	f
cmnwfofbm00021lmmw1lu5hj3	Sálario Rei dos Queijos	ENTRADA	1000	2026-04-10 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-13 00:07:35.314	2026-04-13 00:07:35.314	cmnum8pui000037p8x9fwhlqj	cmnumiel600011zmm00qq52oz	\N	\N	\N	f	cmnwfny8y00011lmm25j5v6dq	\N	f
cmnwfok1000031lmmpzflq4cp	Sálario	ENTRADA	23250	2026-04-30 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-13 00:07:41.412	2026-04-13 00:07:41.412	cmnum8pui000037p8x9fwhlqj	cmnumiel600011zmm00qq52oz	\N	\N	\N	f	cmnwfmmvm00001lmm5y3if0gx	\N	f
cmnxt9n5d000s1lmmqsdycxaw	Criolipolise	SAIDA	300	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	6	10	2026-04-13 23:15:46.417	2026-04-13 23:15:46.417	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxt9n5d000t1lmmb7tql05s	Criolipolise	SAIDA	300	2026-05-13 15:00:00	PARCELADO	CREDITO		MANUAL	7	10	2026-04-13 23:15:46.417	2026-04-13 23:15:46.417	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxt9n5d000u1lmmd1azns50	Criolipolise	SAIDA	300	2026-06-13 15:00:00	PARCELADO	CREDITO		MANUAL	8	10	2026-04-13 23:15:46.417	2026-04-13 23:15:46.417	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxt9n5d000v1lmmyx4w5wg8	Criolipolise	SAIDA	300	2026-07-13 15:00:00	PARCELADO	CREDITO		MANUAL	9	10	2026-04-13 23:15:46.417	2026-04-13 23:15:46.417	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxt9n5d000w1lmmnx0o9frf	Criolipolise	SAIDA	300	2026-08-13 15:00:00	PARCELADO	CREDITO		MANUAL	10	10	2026-04-13 23:15:46.417	2026-04-13 23:15:46.417	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwb114001i1lmmy80097sc	Mercado Livre	SAIDA	578	2026-04-27 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 00:40:49.912	2026-04-14 00:40:49.912	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmnxwfbz000221lmmtxn8lej5	Apple	SAIDA	9.99	2026-07-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:10.716	2026-04-14 00:44:10.716	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfbz000231lmmwaxz9scu	Apple	SAIDA	9.99	2026-08-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:10.716	2026-04-14 00:44:10.716	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfbz000241lmm3q3l2jmj	Apple	SAIDA	9.99	2026-09-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:10.716	2026-04-14 00:44:10.716	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxwfbz000251lmm1shfc6fy	Apple	SAIDA	9.99	2026-10-30 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 00:44:10.716	2026-04-14 00:44:10.716	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx66th005t1lmmh5s0115x	PHP storm	SAIDA	34.26	2027-02-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:03.749	2026-04-14 01:05:03.749	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx66th005u1lmm9iqzeqpk	PHP storm	SAIDA	34.26	2027-03-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:03.749	2026-04-14 01:05:03.749	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx6xku005w1lmmklp1eoe1	Totalpass	SAIDA	60	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:38.43	2026-04-14 01:05:38.43	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx6xku005x1lmmc1btgfbw	Totalpass	SAIDA	60	2026-05-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:38.43	2026-04-14 01:05:38.43	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx6xku005y1lmmin2wic95	Totalpass	SAIDA	60	2026-06-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:38.43	2026-04-14 01:05:38.43	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx6xku005z1lmm7rwfydns	Totalpass	SAIDA	60	2026-07-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:38.43	2026-04-14 01:05:38.43	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx6xku00601lmmc3yb4l9s	Totalpass	SAIDA	60	2026-08-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:38.43	2026-04-14 01:05:38.43	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx6xku00611lmm03ssvrlx	Totalpass	SAIDA	60	2026-09-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:38.43	2026-04-14 01:05:38.43	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx6xku00621lmmly2dctj8	Totalpass	SAIDA	60	2026-10-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:38.43	2026-04-14 01:05:38.43	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx6xku00631lmm4psscmpb	Totalpass	SAIDA	60	2026-11-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:38.43	2026-04-14 01:05:38.43	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx6xku00641lmmm9637qu9	Totalpass	SAIDA	60	2026-12-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:38.43	2026-04-14 01:05:38.43	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx6xku00651lmme8jwizwq	Totalpass	SAIDA	60	2027-01-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:38.43	2026-04-14 01:05:38.43	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx6xku00661lmm059jkfpt	Totalpass	SAIDA	60	2027-02-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:38.43	2026-04-14 01:05:38.43	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxx6xku00671lmmnw07n2w3	Totalpass	SAIDA	60	2027-03-13 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-14 01:05:38.43	2026-04-14 01:05:38.43	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmnxxtus800681lmm3r5pqcge	Valor total abril	SAIDA	1120.38	2026-03-31 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 01:23:27.896	2026-04-14 01:23:27.896	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnunhc7c00071zmmntub3e5e	\N	f	\N	\N	f
cmnxxuqsc00691lmmsrarsk2i	Valor total abril	SAIDA	2384.37	2026-03-24 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 01:24:09.372	2026-04-14 01:24:09.372	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmnxxvpcw006a1lmmqqdw648p	Valor total abril	SAIDA	3791.35	2026-03-17 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 01:24:54.176	2026-04-14 01:24:54.176	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyeqcjl006d1lmmu6ztt5so	Sonia desing	SAIDA	65	2026-04-14 15:00:00	PARCELADO	CREDITO		MANUAL	3	6	2026-04-14 09:16:37.761	2026-04-14 09:16:37.761	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyeqcjm006e1lmmsb7ond4x	Sonia desing	SAIDA	65	2026-05-14 15:00:00	PARCELADO	CREDITO		MANUAL	4	6	2026-04-14 09:16:37.761	2026-04-14 09:16:37.761	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyeqcjm006f1lmm75ujmgnd	Sonia desing	SAIDA	65	2026-06-14 15:00:00	PARCELADO	CREDITO		MANUAL	5	6	2026-04-14 09:16:37.761	2026-04-14 09:16:37.761	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyeqcjm006g1lmmt0q7sibs	Sonia desing	SAIDA	65	2026-07-14 15:00:00	PARCELADO	CREDITO		MANUAL	6	6	2026-04-14 09:16:37.761	2026-04-14 09:16:37.761	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyer9wo006h1lmmj0j5mkgw	Bravo jogos	SAIDA	44.97	2026-04-14 15:00:00	PARCELADO	CREDITO		MANUAL	3	4	2026-04-14 09:17:21	2026-04-14 09:17:21	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyer9wo006i1lmmm3k62t8z	Bravo jogos	SAIDA	44.97	2026-05-14 15:00:00	PARCELADO	CREDITO		MANUAL	4	4	2026-04-14 09:17:21	2026-04-14 09:17:21	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyes9i9006j1lmmfhtm6bti	Bateria celular	SAIDA	110	2026-04-14 15:00:00	PARCELADO	CREDITO		MANUAL	2	3	2026-04-14 09:18:07.137	2026-04-14 09:18:07.137	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyes9ia006k1lmmjlaaxbn7	Bateria celular	SAIDA	110	2026-05-14 15:00:00	PARCELADO	CREDITO		MANUAL	3	3	2026-04-14 09:18:07.137	2026-04-14 09:18:07.137	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyetdpr006m1lmmxd160ilr	Servidor Hostignger	SAIDA	66.95	2026-05-14 15:00:00	PARCELADO	CREDITO		MANUAL	3	11	2026-04-14 09:18:59.247	2026-04-14 09:18:59.247	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyetdpr006n1lmmte7euen7	Servidor Hostignger	SAIDA	66.95	2026-06-14 15:00:00	PARCELADO	CREDITO		MANUAL	4	11	2026-04-14 09:18:59.247	2026-04-14 09:18:59.247	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyetdpr006o1lmmu5xagls7	Servidor Hostignger	SAIDA	66.95	2026-07-14 15:00:00	PARCELADO	CREDITO		MANUAL	5	11	2026-04-14 09:18:59.247	2026-04-14 09:18:59.247	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyetdpr006p1lmmfx9mliis	Servidor Hostignger	SAIDA	66.95	2026-08-14 15:00:00	PARCELADO	CREDITO		MANUAL	6	11	2026-04-14 09:18:59.247	2026-04-14 09:18:59.247	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyetdps006q1lmmc7tjo4iq	Servidor Hostignger	SAIDA	66.95	2026-09-14 15:00:00	PARCELADO	CREDITO		MANUAL	7	11	2026-04-14 09:18:59.247	2026-04-14 09:18:59.247	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyetdps006r1lmmfv59oqjq	Servidor Hostignger	SAIDA	66.95	2026-10-14 15:00:00	PARCELADO	CREDITO		MANUAL	8	11	2026-04-14 09:18:59.247	2026-04-14 09:18:59.247	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyetdps006s1lmmqhdbxa6n	Servidor Hostignger	SAIDA	66.95	2026-11-14 15:00:00	PARCELADO	CREDITO		MANUAL	9	11	2026-04-14 09:18:59.247	2026-04-14 09:18:59.247	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyetdps006t1lmmzoit7ra9	Servidor Hostignger	SAIDA	66.95	2026-12-14 15:00:00	PARCELADO	CREDITO		MANUAL	10	11	2026-04-14 09:18:59.247	2026-04-14 09:18:59.247	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyelyei006b1lmm4d7gae5g	Coop	SAIDA	7.49	2026-04-14 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 09:13:12.81	2026-04-19 19:04:13.099	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmnyemc98006c1lmmy5doe2hs	Restaurante	SAIDA	50	2026-04-14 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 09:13:30.764	2026-04-19 19:04:14.539	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmnyetdpr006l1lmm8tffcfh9	Servidor Hostignger	SAIDA	66.96	2026-04-14 15:00:00	PARCELADO	CREDITO		MANUAL	2	11	2026-04-14 09:18:59.247	2026-04-19 19:23:01.961	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnyetdps006u1lmmf8fo3xp0	Servidor Hostignger	SAIDA	67.06	2027-01-14 15:00:00	PARCELADO	CREDITO		MANUAL	11	11	2026-04-14 09:18:59.247	2026-04-14 09:18:59.247	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmnxx6h59005v1lmms7iiu0d8	Petlove	SAIDA	1	2026-04-13 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 01:05:17.133	2026-04-19 18:34:50.811	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmo641jjr00021lmm688e7fbf	Farmacia	SAIDA	208.9	2026-04-19 15:00:00	PARCELADO	CREDITO	Open Bst	MANUAL	1	1	2026-04-19 18:39:33.687	2026-04-19 18:39:36.731	cmnum8pui000037p8x9fwhlqj	cmnurbqkb00131lmmq6bckgw4	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmo642duj00031lmms34cy9yb	Carrefour	SAIDA	47.55	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 18:40:12.955	2026-04-19 18:40:15.38	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmo6432j200041lmmdbmrw3yn	Banho cachorras	SAIDA	315	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 18:40:44.942	2026-04-19 18:40:47.347	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmo64401p00051lmmd92xdqw3	Sky (benaflora)	SAIDA	134.75	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 18:41:28.381	2026-04-19 18:42:02.475	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmo645kr700071lmmob3z9llw	HDI seguros	SAIDA	383.11	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:42:41.875	2026-04-19 18:42:41.875	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo645kr700081lmmvvudhxcu	HDI seguros	SAIDA	383.11	2026-05-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:42:41.875	2026-04-19 18:42:41.875	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo645kr700091lmml01i8bf3	HDI seguros	SAIDA	383.11	2026-06-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:42:41.875	2026-04-19 18:42:41.875	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo645kr7000a1lmm3apc5koc	HDI seguros	SAIDA	383.11	2026-07-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:42:41.875	2026-04-19 18:42:41.875	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo645kr8000b1lmm17tze7hh	HDI seguros	SAIDA	383.11	2026-08-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:42:41.875	2026-04-19 18:42:41.875	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo645kr8000c1lmm54jkggmq	HDI seguros	SAIDA	383.11	2026-09-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:42:41.875	2026-04-19 18:42:41.875	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo645kr8000d1lmmu9upgvti	HDI seguros	SAIDA	383.11	2026-10-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:42:41.875	2026-04-19 18:42:41.875	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo6487kf000i1lmm9d9e44qe	Claude AI	SAIDA	118.4	2026-05-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:44:44.751	2026-04-19 18:44:44.751	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo6487kf000j1lmmlw01tikk	Claude AI	SAIDA	118.4	2026-06-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:44:44.751	2026-04-19 18:44:44.751	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo6487kf000k1lmmduzq2iwf	Claude AI	SAIDA	118.4	2026-07-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:44:44.751	2026-04-19 18:44:44.751	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo6487kf000l1lmmntqoamo8	Claude AI	SAIDA	118.4	2026-08-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:44:44.751	2026-04-19 18:44:44.751	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo6487kf000m1lmmncvsm8pg	Claude AI	SAIDA	118.4	2026-09-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:44:44.751	2026-04-19 18:44:44.751	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo64645p000e1lmm4cdt8q62	Ritalina	SAIDA	93.59	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 18:43:07.021	2026-04-19 18:55:42.266	cmnum8pui000037p8x9fwhlqj	cmnurbqkb00131lmmq6bckgw4	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmo6473n2000f1lmm1ldhge28	Imperio da costela (jogo)	SAIDA	20	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 18:43:53.006	2026-04-19 18:55:44.453	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmo647mic000g1lmmgg7zf4f7	Imperio da costela	SAIDA	295.46	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 18:44:17.46	2026-04-19 18:55:46.371	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmo644luq00061lmmf4up8w5b	Shoope (produtos para o rosto)	SAIDA	133.88	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 18:41:56.642	2026-04-19 18:55:53.012	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmnyett82006v1lmm10yv9niv	Caneca e bistro	SAIDA	184.25	2026-04-14 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 09:19:19.346	2026-04-19 19:04:34.61	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmnyewp8l006y1lmmx6qekxxn	Atacado de embalagens	SAIDA	31.18	2026-04-14 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 09:21:34.149	2026-04-19 19:21:01.125	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmnyex9v2006z1lmmpzdw70oy	Mercado mirassol	SAIDA	86.01	2026-04-14 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 09:22:00.878	2026-04-19 19:21:02.961	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmnyey4o500701lmm5mvhg2wh	Estacionamento Médico	SAIDA	24	2026-04-14 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-14 09:22:40.805	2026-04-19 19:21:06.389	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmnygkze700011lmmtlzkw3py	Supermercado	SAIDA	366.64	2026-04-14 10:08:07.172	PENDENTE	CREDITO		MANUAL	\N	\N	2026-04-14 10:08:26.671	2026-04-19 19:21:36.297	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo6487kf000h1lmmxxiao3ev	Claude AI	SAIDA	118.17	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:44:44.751	2026-04-20 19:15:45.1	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo6487kg000n1lmm1xu5miz0	Claude AI	SAIDA	118.4	2026-10-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:44:44.751	2026-04-19 18:44:44.751	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo6487kg000o1lmmp1htuwbn	Claude AI	SAIDA	118.4	2026-11-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:44:44.751	2026-04-19 18:44:44.751	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo6487kg000p1lmmwo5lfmv2	Claude AI	SAIDA	118.4	2026-12-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:44:44.751	2026-04-19 18:44:44.751	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo6487kg000q1lmm2ox2bc9z	Claude AI	SAIDA	118.4	2027-01-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:44:44.751	2026-04-19 18:44:44.751	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo6487kg000r1lmmnbryx129	Claude AI	SAIDA	118.4	2027-02-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:44:44.751	2026-04-19 18:44:44.751	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo6487kg000s1lmm2k7dklhz	Claude AI	SAIDA	118.4	2027-03-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 18:44:44.751	2026-04-19 18:44:44.751	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo64jdwc000t1lmmrozey30p	IOF de compra internacional (PHPSTORM)	SAIDA	1.19	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 18:53:26.172	2026-04-19 18:55:28.012	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmo65dzgn00031lmm3e8ebahs	Empréstimo — Atacado de embalagens - ovos de páscoa (2/2)	SAIDA	274.94	2026-05-19 19:16:42.483	PARCELADO	CREDITO	\N	MANUAL	2	2	2026-04-19 19:17:13.799	2026-04-19 19:17:13.799	cmnum8pui000037p8x9fwhlqj	\N	\N	cmnun7a5200061zmmdc95to1d	cmo65dzgi00021lmmdoqu6mqq	f	\N	\N	f
cmo65dzgd00011lmm59pvbxi1	Empréstimo — Atacado de embalagens - ovos de páscoa (1/2)	SAIDA	274.94	2026-04-19 19:16:42.483	PARCELADO	CREDITO		MANUAL	1	2	2026-04-19 19:17:13.789	2026-04-19 19:18:49.977	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnun7a5200061zmmdc95to1d	cmo65dzfw00001lmmwb1l91gj	f	\N	\N	f
cmo65n6f500041lmmzsac6mnc	Carrefour	SAIDA	26.05	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:24:22.721	2026-04-19 19:24:24.603	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo65p3ch00071lmmn36znfd4	Ifood - Jeronimo	SAIDA	41.91	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:25:52.049	2026-04-19 19:25:55.25	cmnum8pui000037p8x9fwhlqj	cmnurd4rb00151lmmagl7wupd	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo65oah300051lmm9xoij50v	Cabeleireiro	SAIDA	217.5	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	2	2026-04-19 19:25:14.631	2026-04-19 19:25:57.412	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo65oah300061lmm7bya34oi	Cabeleireiro	SAIDA	217.5	2026-05-19 15:00:00	PARCELADO	CREDITO		MANUAL	2	2	2026-04-19 19:25:14.631	2026-04-19 19:26:03.7	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo65q49x00081lmmvtsbq3fk	Feira - Tempero	SAIDA	20	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:26:39.91	2026-04-19 19:26:42.343	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo65syqh000a1lmm4etqmf2v	Renner	SAIDA	254.8	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	2	2026-04-19 19:28:52.697	2026-04-19 19:28:52.697	cmnum8pui000037p8x9fwhlqj	cmo65s7sl00091lmmgmxmg142	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmo65syqh000b1lmmm08rnb0g	Renner	SAIDA	254.8	2026-05-19 15:00:00	PARCELADO	CREDITO		MANUAL	2	2	2026-04-19 19:28:52.697	2026-04-19 19:28:52.697	cmnum8pui000037p8x9fwhlqj	cmo65s7sl00091lmmgmxmg142	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmo65tmbc000c1lmmmq9ywk8c	C&A	SAIDA	83.33	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	3	2026-04-19 19:29:23.256	2026-04-19 19:29:23.256	cmnum8pui000037p8x9fwhlqj	cmo65s7sl00091lmmgmxmg142	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmo65tmbc000d1lmm07h8ujah	C&A	SAIDA	83.33	2026-05-19 15:00:00	PARCELADO	CREDITO		MANUAL	2	3	2026-04-19 19:29:23.256	2026-04-19 19:29:23.256	cmnum8pui000037p8x9fwhlqj	cmo65s7sl00091lmmgmxmg142	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmo65tmbc000e1lmm9zfp4xpz	C&A	SAIDA	83.33	2026-06-19 15:00:00	PARCELADO	CREDITO		MANUAL	3	3	2026-04-19 19:29:23.256	2026-04-19 19:29:23.256	cmnum8pui000037p8x9fwhlqj	cmo65s7sl00091lmmgmxmg142	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmo65uplr000g1lmm3wgpgdqo	Gasolina	SAIDA	50	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:30:14.175	2026-04-19 19:30:16.3	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo65udm8000f1lmmnt4h10ef	Farmacia	SAIDA	82.29	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:29:58.64	2026-04-19 19:30:18.898	cmnum8pui000037p8x9fwhlqj	cmnurbqkb00131lmmq6bckgw4	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo65vfpf000h1lmm0yhdwd2p	Carrefour	SAIDA	399.4	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:30:48.003	2026-04-19 19:30:50.268	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo65wzrl000j1lmm0oow3lqj	Farmacia	SAIDA	86.14	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:32:00.657	2026-04-19 19:32:05.441	cmnum8pui000037p8x9fwhlqj	cmnurbqkb00131lmmq6bckgw4	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo65w7do000i1lmmemg19fcn	Gasolina	SAIDA	153.97	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:31:23.868	2026-04-19 19:32:06.547	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo65y09j000k1lmmppaj5v94	Clube livelo	SAIDA	44.9	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:32:47.959	2026-04-19 19:32:47.959	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo65y09j000l1lmml3u1x4pt	Clube livelo	SAIDA	44.9	2026-05-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:32:47.959	2026-04-19 19:32:47.959	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo65y09j000m1lmm03tx2a8v	Clube livelo	SAIDA	44.9	2026-06-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:32:47.959	2026-04-19 19:32:47.959	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo65y09j000n1lmmokihb1oh	Clube livelo	SAIDA	44.9	2026-07-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:32:47.959	2026-04-19 19:32:47.959	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo65y09j000o1lmmg365k5t4	Clube livelo	SAIDA	44.9	2026-08-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:32:47.959	2026-04-19 19:32:47.959	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo65y09j000p1lmmbi15ydg7	Clube livelo	SAIDA	44.9	2026-09-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:32:47.959	2026-04-19 19:32:47.959	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo65y09j000q1lmmn8fjckyo	Clube livelo	SAIDA	44.9	2026-10-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:32:47.959	2026-04-19 19:32:47.959	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo65y09j000r1lmm4zl30b8w	Clube livelo	SAIDA	44.9	2026-11-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:32:47.959	2026-04-19 19:32:47.959	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo65y09j000s1lmm2h3gkl8c	Clube livelo	SAIDA	44.9	2026-12-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:32:47.959	2026-04-19 19:32:47.959	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo65y09j000t1lmm0uanff7c	Clube livelo	SAIDA	44.9	2027-01-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:32:47.959	2026-04-19 19:32:47.959	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo65y09j000u1lmms8vf2x16	Clube livelo	SAIDA	44.9	2027-02-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:32:47.959	2026-04-19 19:32:47.959	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo65y09k000v1lmmqjp7fqd1	Clube livelo	SAIDA	44.9	2027-03-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:32:47.959	2026-04-19 19:32:47.959	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo65ypoz000w1lmm1ljaa445	Energetico	SAIDA	4.8	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:33:20.915	2026-04-19 19:33:24.772	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo65zhsa000x1lmm36old8cj	Ração Gato	SAIDA	149.52	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:33:57.322	2026-04-19 19:33:59.63	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo6603m2000y1lmm2sj88x41	Farmacia	SAIDA	32.99	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:34:25.61	2026-04-19 19:34:32.203	cmnum8pui000037p8x9fwhlqj	cmnurbqkb00131lmmq6bckgw4	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo660tg6000z1lmmggcn443i	Energetico	SAIDA	4.8	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:34:59.094	2026-04-19 19:35:09.863	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo660zmm00101lmm778gy9jh	Energetico	SAIDA	4.8	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:35:07.102	2026-04-19 19:35:11.063	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo661ree00111lmmt6eb2t8s	Farmacia	SAIDA	102.51	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:35:43.094	2026-04-19 19:35:44.561	cmnum8pui000037p8x9fwhlqj	cmnurbqkb00131lmmq6bckgw4	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo6626l200121lmmfaw4rlbk	Coop	SAIDA	18.46	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:36:02.774	2026-04-19 19:36:04.665	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo662r5a00131lmmiovbrkx3	GamePass	SAIDA	59.9	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:36:29.422	2026-04-19 19:36:29.422	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo662r5a00141lmmckfgornh	GamePass	SAIDA	59.9	2026-05-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:36:29.422	2026-04-19 19:36:29.422	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo662r5a00151lmmykvigbbb	GamePass	SAIDA	59.9	2026-06-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:36:29.422	2026-04-19 19:36:29.422	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo662r5a00161lmmlgu5ofry	GamePass	SAIDA	59.9	2026-07-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:36:29.422	2026-04-19 19:36:29.422	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo662r5a00171lmmty2k3a3f	GamePass	SAIDA	59.9	2026-08-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:36:29.422	2026-04-19 19:36:29.422	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo662r5a00181lmmwkddczkt	GamePass	SAIDA	59.9	2026-09-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:36:29.422	2026-04-19 19:36:29.422	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo662r5b00191lmm8eab0giq	GamePass	SAIDA	59.9	2026-10-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:36:29.422	2026-04-19 19:36:29.422	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo662r5b001a1lmmol5bmoms	GamePass	SAIDA	59.9	2026-11-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:36:29.422	2026-04-19 19:36:29.422	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo662r5b001b1lmmn2n14mi1	GamePass	SAIDA	59.9	2026-12-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:36:29.422	2026-04-19 19:36:29.422	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo662r5b001c1lmmce55vwgr	GamePass	SAIDA	59.9	2027-01-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:36:29.422	2026-04-19 19:36:29.422	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo662r5b001d1lmmi5oolfy0	GamePass	SAIDA	59.9	2027-02-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:36:29.422	2026-04-19 19:36:29.422	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo662r5b001e1lmmhwtsgvnw	GamePass	SAIDA	59.9	2027-03-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:36:29.422	2026-04-19 19:36:29.422	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo663abe001f1lmm10zrax3h	Carrefour	SAIDA	605.52	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:36:54.266	2026-04-19 19:36:55.812	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo6642jn001g1lmmscstunyv	Mesa 	SAIDA	76.67	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	3	2026-04-19 19:37:30.851	2026-04-19 19:37:30.851	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmo6642jn001h1lmm6dbsnuu4	Mesa 	SAIDA	76.67	2026-05-19 15:00:00	PARCELADO	CREDITO		MANUAL	2	3	2026-04-19 19:37:30.851	2026-04-19 19:37:30.851	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmo6642jn001i1lmm05vff9bs	Mesa 	SAIDA	76.67	2026-06-19 15:00:00	PARCELADO	CREDITO		MANUAL	3	3	2026-04-19 19:37:30.851	2026-04-19 19:37:30.851	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmo664kty001j1lmmn3t5qobc	Padaria	SAIDA	53.33	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:37:54.55	2026-04-19 19:37:57.506	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo66523b001k1lmmwiap3765	Energetico	SAIDA	6	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:38:16.919	2026-04-19 19:38:18.576	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo665gn5001l1lmm40w3e8t5	Barra de proteina	SAIDA	6	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:38:35.777	2026-04-19 19:38:37.818	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo665xm6001m1lmmghp64mzl	Ifood Esfiha	SAIDA	33.69	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:38:57.774	2026-04-19 19:39:00.002	cmnum8pui000037p8x9fwhlqj	cmnurd4rb00151lmmagl7wupd	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo666ggj001n1lmmgsczdrde	Restaurante (Divino fogão)	SAIDA	36.99	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:39:22.195	2026-04-19 19:39:24.59	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo6679is001o1lmmhh8shzyv	Cacau show	SAIDA	38.51	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:39:59.86	2026-04-19 19:40:01.97	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo667sn3001p1lmm1fnbt0k1	Presente Nielson	SAIDA	69.99000000000001	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:40:24.639	2026-04-19 19:40:28.769	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo668gzq001q1lmmgwjtezn3	Pão de Açucar	SAIDA	75.2	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:40:56.198	2026-04-19 19:40:58.049	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo669afa001r1lmmjg0zpewq	Coop emporio	SAIDA	89.25	2026-04-19 15:00:00	PARCELADO	CREDITO	carnes	MANUAL	1	1	2026-04-19 19:41:34.342	2026-04-19 19:41:36.399	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo669qki001s1lmmr1zd5odc	Swift	SAIDA	35.9	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:41:55.266	2026-04-19 19:41:58.204	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo66bb4c001u1lmmttq2schz	Apple	SAIDA	5.9	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:43:08.556	2026-04-19 19:43:08.556	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo66bb4c001v1lmmx39z5415	Apple	SAIDA	5.9	2026-05-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:43:08.556	2026-04-19 19:43:08.556	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo66bb4c001w1lmmljg2xwq8	Apple	SAIDA	5.9	2026-06-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:43:08.556	2026-04-19 19:43:08.556	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo66bb4c001x1lmmg8k9t7lg	Apple	SAIDA	5.9	2026-07-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:43:08.556	2026-04-19 19:43:08.556	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo66bb4c001y1lmme3rjakb5	Apple	SAIDA	5.9	2026-08-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:43:08.556	2026-04-19 19:43:08.556	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo66bb4c001z1lmmj0qg4fqu	Apple	SAIDA	5.9	2026-09-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:43:08.556	2026-04-19 19:43:08.556	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo66bb4c00201lmmz487mpwn	Apple	SAIDA	5.9	2026-10-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:43:08.556	2026-04-19 19:43:08.556	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo66bb4c00211lmmrn2eufsl	Apple	SAIDA	5.9	2026-11-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:43:08.556	2026-04-19 19:43:08.556	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo66bb4c00221lmmrpq6diae	Apple	SAIDA	5.9	2026-12-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:43:08.556	2026-04-19 19:43:08.556	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo66bb4c00231lmm93hgjxfu	Apple	SAIDA	5.9	2027-01-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:43:08.556	2026-04-19 19:43:08.556	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo66bb4c00241lmmxgxavfl4	Apple	SAIDA	5.9	2027-02-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:43:08.556	2026-04-19 19:43:08.556	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo66bb4c00251lmmzmnzqi0z	Apple	SAIDA	5.9	2027-03-19 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-19 19:43:08.556	2026-04-19 19:43:08.556	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnun7a5200061zmmdc95to1d	\N	t	\N	\N	f
cmo66atpy001t1lmmndghtght	Bolo Aniversário	SAIDA	86.9	2026-04-19 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-19 19:42:46.006	2026-04-19 19:43:23.954	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	t
cmo67qf09002a1lmmmyf42kad	Faxineira	SAIDA	250	2026-04-15 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-19 20:22:53.049	2026-04-19 20:22:53.049	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	\N	\N	f	cmnwejg2000021lmmanuasbzd	\N	f
cmo7ctztm000j1lmmseziulr6	Empréstimo — Eduardo (1/8)	SAIDA	288.37	2026-04-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	1	8	2026-04-20 15:33:24.25	2026-04-20 15:50:09.258	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7ctzt9000i1lmmlxl3m1yz	f	\N	\N	f
cmo7ctztt000l1lmm45y4a8y9	Empréstimo — Eduardo (2/8)	SAIDA	288.37	2026-05-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	2	8	2026-04-20 15:33:24.257	2026-04-20 15:50:22.224	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7ctztq000k1lmm7ft0tdyx	f	\N	\N	f
cmo7ctztz000n1lmm9608fvms	Empréstimo — Eduardo (3/8)	SAIDA	288.37	2026-06-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	3	8	2026-04-20 15:33:24.263	2026-04-20 15:50:30.901	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7ctztw000m1lmml9clf4ez	f	\N	\N	f
cmo7ctzu4000p1lmmwq6qb0eo	Empréstimo — Eduardo (4/8)	SAIDA	288.37	2026-07-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	4	8	2026-04-20 15:33:24.268	2026-04-20 15:50:39.679	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7ctzu1000o1lmm2asu89j4	f	\N	\N	f
cmo7ctzua000r1lmm17f6btqb	Empréstimo — Eduardo (5/8)	SAIDA	288.37	2026-08-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	5	8	2026-04-20 15:33:24.274	2026-04-20 15:50:46.928	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7ctzu7000q1lmmaulxbd8a	f	\N	\N	f
cmo7ctzug000t1lmmexx3z6ze	Empréstimo — Eduardo (6/8)	SAIDA	288.37	2026-09-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	6	8	2026-04-20 15:33:24.28	2026-04-20 15:50:55.374	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7ctzud000s1lmm8s73pn6j	f	\N	\N	f
cmo7ctzum000v1lmmujlawttw	Empréstimo — Eduardo (7/8)	SAIDA	288.37	2026-10-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	7	8	2026-04-20 15:33:24.286	2026-04-20 15:51:03.659	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7ctzuk000u1lmmzjo795wq	f	\N	\N	f
cmo7ctzus000x1lmme5kliacp	Empréstimo — Eduardo (8/8)	SAIDA	288.37	2026-11-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	8	8	2026-04-20 15:33:24.292	2026-04-20 15:51:12.442	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7ctzup000w1lmmw3piissv	f	\N	\N	f
cmo7ej5rh001g1lmmbfpohvn8	Ipva	SAIDA	188.47	2026-04-20 15:00:00	PARCELADO	CREDITO		MANUAL	4	11	2026-04-20 16:20:57.965	2026-04-20 16:20:57.965	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmo7ej5rh001h1lmmlbr7r4de	Ipva	SAIDA	188.47	2026-05-20 15:00:00	PARCELADO	CREDITO		MANUAL	5	11	2026-04-20 16:20:57.965	2026-04-20 16:20:57.965	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmo7ej5rh001i1lmmu1njy3lm	Ipva	SAIDA	188.47	2026-06-20 15:00:00	PARCELADO	CREDITO		MANUAL	6	11	2026-04-20 16:20:57.965	2026-04-20 16:20:57.965	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmo7ej5rh001j1lmm2rluer8q	Ipva	SAIDA	188.47	2026-07-20 15:00:00	PARCELADO	CREDITO		MANUAL	7	11	2026-04-20 16:20:57.965	2026-04-20 16:20:57.965	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmo7ej5rh001k1lmmlr7x26hs	Ipva	SAIDA	188.47	2026-08-20 15:00:00	PARCELADO	CREDITO		MANUAL	8	11	2026-04-20 16:20:57.965	2026-04-20 16:20:57.965	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmo7ej5rh001l1lmm6ucsi9x1	Ipva	SAIDA	188.47	2026-09-20 15:00:00	PARCELADO	CREDITO		MANUAL	9	11	2026-04-20 16:20:57.965	2026-04-20 16:20:57.965	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmo7egtzd00171lmmb3y2o6zw	Empréstimo — Inês (1/5)	SAIDA	331.3	2026-04-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	1	5	2026-04-20 16:19:09.385	2026-04-20 16:21:47.481	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7egtz100161lmmzm08pbxb	f	\N	\N	f
cmo7egtzk00191lmmayuck6ru	Empréstimo — Inês (2/5)	SAIDA	331.3	2026-05-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	2	5	2026-04-20 16:19:09.392	2026-04-20 16:21:56.744	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7egtzi00181lmm3236l833	f	\N	\N	f
cmo7egtzq001b1lmm7vzj1hb5	Empréstimo — Inês (3/5)	SAIDA	331.3	2026-06-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	3	5	2026-04-20 16:19:09.398	2026-04-20 16:22:07.198	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7egtzn001a1lmmbbsa4aze	f	\N	\N	f
cmo7egtzv001d1lmmb0t8hk61	Empréstimo — Inês (4/5)	SAIDA	331.3	2026-07-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	4	5	2026-04-20 16:19:09.403	2026-04-20 16:22:13.927	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7egtzs001c1lmm3137e6yz	f	\N	\N	f
cmo7egu01001f1lmm6w7fg29k	Empréstimo — Inês (5/5)	SAIDA	331.3	2026-08-20 15:31:42.333	PARCELADO	CREDITO		MANUAL	5	5	2026-04-20 16:19:09.409	2026-04-20 16:22:22.044	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnuuqlav00471lmmtgtwx5m1	cmo7egtzx001e1lmmiow8fe65	f	\N	\N	f
cmo7ej5rh001m1lmmhngyf6jq	Ipva	SAIDA	188.47	2026-10-20 15:00:00	PARCELADO	CREDITO		MANUAL	10	11	2026-04-20 16:20:57.965	2026-04-20 16:20:57.965	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmo7ej5rh001n1lmmhbzbevya	Ipva	SAIDA	188.47	2026-11-20 15:00:00	PARCELADO	CREDITO		MANUAL	11	11	2026-04-20 16:20:57.965	2026-04-20 16:20:57.965	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmo7fo9ak001o1lmmowlio5rp	Empresa - Prolabore	SAIDA	178.31	2026-04-20 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-20 16:52:55.436	2026-04-20 16:52:55.436	cmnum8pui000037p8x9fwhlqj	cmnwfpv8500041lmm0ypzc34u	\N	\N	\N	f	cmo67l20800261lmmunhvkjqk	\N	f
cmo7fpq5c001p1lmmih9omsbg	Empresa - Imposto	SAIDA	1498.05	2026-04-20 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-20 16:54:03.936	2026-04-20 16:54:03.936	cmnum8pui000037p8x9fwhlqj	cmnwfpv8500041lmm0ypzc34u	\N	\N	\N	f	cmo67m6c700271lmm48i22uv8	\N	f
cmo7fqurc001q1lmmeom1snfg	Empresa - Parcelamento DAS	SAIDA	70.91	2026-04-20 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-20 16:54:56.568	2026-04-20 16:54:56.568	cmnum8pui000037p8x9fwhlqj	cmnwfpv8500041lmm0ypzc34u	\N	\N	\N	f	cmo67nh8700281lmmi5k86aon	\N	f
cmo7fssao001r1lmmtx7zobmb	Empresa Ricardo	SAIDA	200	2026-04-20 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-20 16:56:26.688	2026-04-20 16:56:26.688	cmnum8pui000037p8x9fwhlqj	cmnwfpv8500041lmm0ypzc34u	\N	\N	\N	f	cmo67nw8m00291lmmaomyxttv	\N	f
cmo7fwg2c001s1lmmx545ctu0	Aluguel	SAIDA	3697.46	2026-04-20 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-20 16:59:17.46	2026-04-20 16:59:17.46	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	\N	\N	f	cmnwg7a4c00071lmm3c2bwr7h	\N	f
cmo7k8cg8001v1lmm9pkfoztp	Pagamento fatura C6 — Abril de 2026	ENTRADA	3791.35	2026-04-01 00:00:00	PAGO	PIX	Ref: 2026-04	MANUAL	\N	\N	2026-04-20 19:00:31.112	2026-04-20 19:00:31.112	cmnum8pui000037p8x9fwhlqj	\N	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmo7k8urj001w1lmmncl34znn	Pagamento fatura Nunbank PJ — Abril de 2026	ENTRADA	5701.51	2026-04-01 00:00:00	PAGO	PIX	Ref: 2026-04	MANUAL	\N	\N	2026-04-20 19:00:54.847	2026-04-20 19:00:54.847	cmnum8pui000037p8x9fwhlqj	\N	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmo7k9c4k001x1lmmbk0jbio6	Pagamento fatura Nubank Fisica — Abril de 2026	ENTRADA	1120.38	2026-04-01 00:00:00	PAGO	PIX	Ref: 2026-04	MANUAL	\N	\N	2026-04-20 19:01:17.348	2026-04-20 19:01:17.348	cmnum8pui000037p8x9fwhlqj	\N	\N	cmnunhc7c00071zmmntub3e5e	\N	f	\N	\N	f
cmo7k9mih001y1lmm3cif4h8j	Pagamento fatura Santander — Abril de 2026	ENTRADA	2384.37	2026-04-01 00:00:00	PAGO	PIX	Ref: 2026-04	MANUAL	\N	\N	2026-04-20 19:01:30.809	2026-04-20 19:01:30.809	cmnum8pui000037p8x9fwhlqj	\N	\N	cmnuuqlav00471lmmtgtwx5m1	\N	f	\N	\N	f
cmo7ko7th00201lmmtzjcj7wb	Meli+	SAIDA	19.9	2026-04-20 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-20 19:12:51.606	2026-04-20 19:12:51.606	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo7ko7ti00211lmm8ozjxgun	Meli+	SAIDA	19.9	2026-05-20 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-20 19:12:51.606	2026-04-20 19:12:51.606	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo7ko7ti00221lmmufy44n4z	Meli+	SAIDA	19.9	2026-06-20 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-20 19:12:51.606	2026-04-20 19:12:51.606	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo7ko7ti00231lmmqwvn77b7	Meli+	SAIDA	19.9	2026-07-20 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-20 19:12:51.606	2026-04-20 19:12:51.606	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo7ko7ti00241lmmkigxpb4k	Meli+	SAIDA	19.9	2026-08-20 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-20 19:12:51.606	2026-04-20 19:12:51.606	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo7ko7ti00251lmmu08ev0lz	Meli+	SAIDA	19.9	2026-09-20 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-20 19:12:51.606	2026-04-20 19:12:51.606	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo7ko7ti00261lmmmekr7ff7	Meli+	SAIDA	19.9	2026-10-20 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-20 19:12:51.606	2026-04-20 19:12:51.606	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo7ko7ti00271lmmgtsaku6e	Meli+	SAIDA	19.9	2026-11-20 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-20 19:12:51.606	2026-04-20 19:12:51.606	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo7ko7ti00281lmmtxj0fohq	Meli+	SAIDA	19.9	2026-12-20 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-20 19:12:51.606	2026-04-20 19:12:51.606	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo7ko7ti00291lmmmfn5jpq9	Meli+	SAIDA	19.9	2027-01-20 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-20 19:12:51.606	2026-04-20 19:12:51.606	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo7ko7ti002a1lmmghunibm6	Meli+	SAIDA	19.9	2027-02-20 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-20 19:12:51.606	2026-04-20 19:12:51.606	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo7ko7ti002b1lmmakb98xqh	Meli+	SAIDA	19.9	2027-03-20 15:00:00	PARCELADO	CREDITO		MANUAL	\N	\N	2026-04-20 19:12:51.606	2026-04-20 19:12:51.606	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	t	\N	\N	f
cmo7kok0x002c1lmmqxxk32n4	Ifood	SAIDA	35.49	2026-04-20 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-20 19:13:07.425	2026-04-20 19:13:10.006	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmo7knmzq001z1lmm5vljvyod	Carrefour	SAIDA	146.82	2026-04-20 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-20 19:12:24.614	2026-04-20 19:13:12.578	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmogcleg000021lmmfvfdar32	Bicicleta	SAIDA	113.64	2026-05-26 15:00:00	PARCELADO	CREDITO		MANUAL	2	12	2026-04-26 22:36:38.88	2026-04-26 22:36:38.88	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogcleg000031lmm1ri5cqoc	Bicicleta	SAIDA	113.64	2026-06-26 15:00:00	PARCELADO	CREDITO		MANUAL	3	12	2026-04-26 22:36:38.88	2026-04-26 22:36:38.88	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogcleg000041lmmqvrr7xoy	Bicicleta	SAIDA	113.64	2026-07-26 15:00:00	PARCELADO	CREDITO		MANUAL	4	12	2026-04-26 22:36:38.88	2026-04-26 22:36:38.88	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogcleg000051lmm30cg9if1	Bicicleta	SAIDA	113.64	2026-08-26 15:00:00	PARCELADO	CREDITO		MANUAL	5	12	2026-04-26 22:36:38.88	2026-04-26 22:36:38.88	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogcleg000061lmmwylvhl63	Bicicleta	SAIDA	113.64	2026-09-26 15:00:00	PARCELADO	CREDITO		MANUAL	6	12	2026-04-26 22:36:38.88	2026-04-26 22:36:38.88	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogcleg000011lmm67ikmy2i	Bicicleta	SAIDA	113.75	2026-04-26 15:00:00	PARCELADO	CREDITO		MANUAL	1	12	2026-04-26 22:36:38.88	2026-04-26 22:44:55.169	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogcleg000071lmmkepcqyyo	Bicicleta	SAIDA	113.64	2026-10-26 15:00:00	PARCELADO	CREDITO		MANUAL	7	12	2026-04-26 22:36:38.88	2026-04-26 22:36:38.88	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogcleg100081lmmyi3d8m4s	Bicicleta	SAIDA	113.64	2026-11-26 15:00:00	PARCELADO	CREDITO		MANUAL	8	12	2026-04-26 22:36:38.88	2026-04-26 22:36:38.88	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogcleg100091lmm2vw7dffp	Bicicleta	SAIDA	113.64	2026-12-26 15:00:00	PARCELADO	CREDITO		MANUAL	9	12	2026-04-26 22:36:38.88	2026-04-26 22:36:38.88	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogcleg1000a1lmmo33kyysv	Bicicleta	SAIDA	113.64	2027-01-26 15:00:00	PARCELADO	CREDITO		MANUAL	10	12	2026-04-26 22:36:38.88	2026-04-26 22:36:38.88	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogcleg1000b1lmm2joz52sv	Bicicleta	SAIDA	113.64	2027-02-26 15:00:00	PARCELADO	CREDITO		MANUAL	11	12	2026-04-26 22:36:38.88	2026-04-26 22:36:38.88	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogcleg1000c1lmm544141xn	Bicicleta	SAIDA	113.75	2027-03-26 15:00:00	PARCELADO	CREDITO		MANUAL	12	12	2026-04-26 22:36:38.88	2026-04-26 22:36:38.88	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogd160u000r1lmmu6bnojsa	Estacionamento	SAIDA	180	2026-04-26 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 22:48:54.462	2026-04-26 22:49:19.805	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmogdk4gb000t1lmmx8e9a8rb	Emporio carnes	SAIDA	147.56	2026-05-06 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 23:03:38.891	2026-04-26 23:04:23.346	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmogdlp5k000v1lmmhcryoia4	Libre	SAIDA	329.99	2026-05-03 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 23:04:52.376	2026-04-26 23:05:16.32	cmnum8pui000037p8x9fwhlqj	cmnurbqkb00131lmmq6bckgw4	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmogcya7t000l1lmmll4wfkvx	Drogaria	SAIDA	56.24	2026-04-26 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 22:46:39.929	2026-04-26 22:49:10.933	cmnum8pui000037p8x9fwhlqj	cmnurbqkb00131lmmq6bckgw4	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmogcyzyl000m1lmmvf7l2r3g	Ifood	SAIDA	47.88	2026-04-26 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 22:47:13.293	2026-04-26 22:49:12.206	cmnum8pui000037p8x9fwhlqj	cmnurd4rb00151lmmagl7wupd	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmogczkio000n1lmmcaeosk20	Gasolina	SAIDA	120	2026-04-26 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 22:47:39.936	2026-04-26 22:49:13.659	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmogczz6n000o1lmm50mbsybm	Oba	SAIDA	100.51	2026-04-26 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 22:47:58.943	2026-04-26 22:49:15.603	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmogd0cqq000p1lmmcwnfvqzx	Coop	SAIDA	6.99	2026-04-26 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 22:48:16.514	2026-04-26 22:49:16.634	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmogd0u9k000q1lmmp457bqk3	Barra de proteina	SAIDA	6	2026-04-26 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 22:48:39.224	2026-04-26 22:49:17.807	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmogdm5ml000w1lmmxg7eeli0	Coop	SAIDA	12.47	2026-05-03 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 23:05:13.725	2026-04-26 23:05:17.514	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmogdnzn7000x1lmmgwzb6gjl	Libre	SAIDA	300	2026-05-03 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 23:06:39.283	2026-04-26 23:06:42.033	cmnum8pui000037p8x9fwhlqj	cmnurbqkb00131lmmq6bckgw4	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoge9v7x001e1lmmsxw2q5ow	Faculdade	SAIDA	284.98	2026-05-03 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 23:23:39.981	2026-04-26 23:23:39.981	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogdpo7b001b1lmm0em76tuc	Médico	SAIDA	350	2026-06-03 15:00:00	PARCELADO	CREDITO		MANUAL	2	2	2026-04-26 23:07:57.767	2026-04-26 23:07:57.767	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogdpo7b001a1lmm9rg4g9vm	Médico	SAIDA	350	2026-05-03 15:00:00	PARCELADO	CREDITO		MANUAL	1	2	2026-04-26 23:07:57.767	2026-04-26 23:09:42.038	cmnum8pui000037p8x9fwhlqj	cmnwe6k2100031lmmtbt0dzzj	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogdt1dm001c1lmm2r69oz9c	Estacionamento	SAIDA	180	2026-04-20 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-04-26 23:10:34.81	2026-04-26 23:10:34.81	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	\N	\N	f	cmnwel1n800051lmmv8ig9436	\N	f
cmogdurw8001d1lmm4z8e81sn	Pagamento — Janaina	SAIDA	155.81	2026-04-26 23:11:52.161	PAGO	PIX		MANUAL	\N	\N	2026-04-26 23:11:55.832	2026-04-26 23:11:55.832	cmnum8pui000037p8x9fwhlqj	\N	\N	\N	\N	f	\N	cmnwfrqr800051lmmigi7nvk9	f
cmogeahow001f1lmmekbeocm9	Faculdade	SAIDA	284.98	2026-06-08 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 23:24:09.104	2026-04-26 23:24:09.104	cmnum8pui000037p8x9fwhlqj	cmnursscm001p1lmmjyxk19e9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmogef5p9001g1lmm29f8lvmi	Sem parar - pedágio	SAIDA	12.89	2026-05-03 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-04-26 23:27:46.845	2026-04-26 23:27:51.689	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop09f600001logo91xdmmo	Advogado	SAIDA	500.07	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	12	2026-05-02 18:46:17.01	2026-05-02 18:46:17.01	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoop09f600011logp9uzp0ww	Advogado	SAIDA	500.07	2026-06-02 15:00:00	PARCELADO	CREDITO		MANUAL	2	12	2026-05-02 18:46:17.01	2026-05-02 18:46:17.01	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoop09f600021logp9tog77w	Advogado	SAIDA	500.07	2026-07-02 15:00:00	PARCELADO	CREDITO		MANUAL	3	12	2026-05-02 18:46:17.01	2026-05-02 18:46:17.01	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoop09f600031logo8jz4gtr	Advogado	SAIDA	500.07	2026-08-02 15:00:00	PARCELADO	CREDITO		MANUAL	4	12	2026-05-02 18:46:17.01	2026-05-02 18:46:17.01	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoop09f600041logjmz4tkf0	Advogado	SAIDA	500.07	2026-09-02 15:00:00	PARCELADO	CREDITO		MANUAL	5	12	2026-05-02 18:46:17.01	2026-05-02 18:46:17.01	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoop09f600051logsqq9t4oy	Advogado	SAIDA	500.07	2026-10-02 15:00:00	PARCELADO	CREDITO		MANUAL	6	12	2026-05-02 18:46:17.01	2026-05-02 18:46:17.01	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoop09f700061logl2ljabqh	Advogado	SAIDA	500.07	2026-11-02 15:00:00	PARCELADO	CREDITO		MANUAL	7	12	2026-05-02 18:46:17.01	2026-05-02 18:46:17.01	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoop09f700071logj2u7et8y	Advogado	SAIDA	500.07	2026-12-02 15:00:00	PARCELADO	CREDITO		MANUAL	8	12	2026-05-02 18:46:17.01	2026-05-02 18:46:17.01	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoop09f700081loguriea77w	Advogado	SAIDA	500.07	2027-01-02 15:00:00	PARCELADO	CREDITO		MANUAL	9	12	2026-05-02 18:46:17.01	2026-05-02 18:46:17.01	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoop09f700091logxfk4vcw6	Advogado	SAIDA	500.07	2027-02-02 15:00:00	PARCELADO	CREDITO		MANUAL	10	12	2026-05-02 18:46:17.01	2026-05-02 18:46:17.01	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoop09f7000a1log9qile5y2	Advogado	SAIDA	500.07	2027-03-02 15:00:00	PARCELADO	CREDITO		MANUAL	11	12	2026-05-02 18:46:17.01	2026-05-02 18:46:17.01	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoop09f7000b1log6anyq0zz	Advogado	SAIDA	500.11	2027-04-02 15:00:00	PARCELADO	CREDITO		MANUAL	12	12	2026-05-02 18:46:17.01	2026-05-02 18:46:17.01	cmnum8pui000037p8x9fwhlqj	cmnuo5dt8000o1zmml3nfzyt2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoop1iv1000c1logqji0tzl5	Pano aspirador robô	SAIDA	28.99	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:47:15.901	2026-05-02 18:47:32.166	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop2cv9000d1logh2367sjl	Emporio carne	SAIDA	147.56	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:47:54.789	2026-05-02 18:47:57.261	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop2tif000e1loggehz0emo	Energetico	SAIDA	4.8	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:48:16.36	2026-05-02 18:48:18.558	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop8izu000m1log6i6kedhu	Energetico	SAIDA	4.8	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:52:42.666	2026-05-02 18:52:45.221	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop3ao0000f1logxxttx9by	Carrefour	SAIDA	484.29	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:48:38.592	2026-05-02 18:48:49.26	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop45g5000g1logh2503cp8	Gasolina	SAIDA	50	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:49:18.485	2026-05-02 18:49:21.296	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop4nht000h1logy2ma1xc0	Energetico	SAIDA	4.8	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:49:41.873	2026-05-02 18:49:44.315	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop554u000i1logbuj5qtb0	Uber	SAIDA	8.93	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:50:04.734	2026-05-02 18:50:10.042	cmnum8pui000037p8x9fwhlqj	cmnurb04500111lmmy92gwr6z	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop5zq0000j1log2zurn239	ChatGtp	SAIDA	107.91	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:50:44.376	2026-05-02 18:50:52.692	cmnum8pui000037p8x9fwhlqj	cmnuppkjx00241zmmb9okvy8y	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop6wh9000k1log7xguggak	Uber	SAIDA	9.94	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:51:26.829	2026-05-02 18:51:28.849	cmnum8pui000037p8x9fwhlqj	cmnurb04500111lmmy92gwr6z	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop7tl3000l1logtbhdjxwu	Onebox tecnologia	SAIDA	37.1	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:52:09.735	2026-05-02 18:52:12.358	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop9kef000n1logmhr3dhby	Perfumaria	SAIDA	136.65	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	2	2026-05-02 18:53:31.143	2026-05-02 18:53:38.355	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoop9kef000o1logptpccp8b	Perfumaria	SAIDA	136.65	2026-06-02 15:00:00	PARCELADO	CREDITO		MANUAL	2	2	2026-05-02 18:53:31.143	2026-05-02 18:53:41.697	cmnum8pui000037p8x9fwhlqj	cmnuns9ap000h1zmm9we1c76s	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopagyj000p1logw38mu8cm	Jeronimo	SAIDA	22	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:54:13.339	2026-05-02 18:54:15.907	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopbxg8000s1logoklp100t	Energetico	SAIDA	4.8	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:55:21.368	2026-05-02 18:56:08.859	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopauak000q1logmez9m7t6	Burguer King	SAIDA	18.400000000000002	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:54:30.62	2026-05-02 18:55:05.646	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopbgr1000r1logc7h2le59	Burguer King	SAIDA	31.8	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:54:59.725	2026-05-02 18:55:07.808	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopct53000u1logsa2h40iu	Facebook (Janaina)	SAIDA	15.9	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:56:02.439	2026-05-02 18:56:02.439	cmnum8pui000037p8x9fwhlqj	cmnuv4idm004l1lmmya52y1e2	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmoopc9rw000t1log6z2gi4qy	Uber	SAIDA	15.5	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:55:37.34	2026-05-02 18:56:09.862	cmnum8pui000037p8x9fwhlqj	cmnurb04500111lmmy92gwr6z	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopdgce000v1logb2z3p70a	Alameda Xingu	SAIDA	44.8	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:56:32.51	2026-05-02 18:56:34.74	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopdqxf000w1log9d7iqy0a	Hanoi	SAIDA	414.3	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:56:46.227	2026-05-02 18:56:48.29	cmnum8pui000037p8x9fwhlqj	cmnup4aqw001y1zmm7m6x0x38	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoope9ma000x1logno7xi8bg	Ração Sol	SAIDA	238.59	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:57:10.45	2026-05-02 18:57:21.451	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopet5d000y1log1e9nogba	Estacionamento	SAIDA	35	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:57:35.762	2026-05-02 18:57:38.669	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopf76v000z1logd9dx5rd4	Colchão cahorras	SAIDA	90.98	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:57:53.959	2026-05-02 18:57:55.502	cmnum8pui000037p8x9fwhlqj	cmnumi3ke00001zmmjnunoenn	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopfkl800101logb6mm140r	Swfit 	SAIDA	85.57	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:58:11.324	2026-05-02 18:58:13.045	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopg22300111logso4thv2z	Bread king	SAIDA	49.98	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:58:33.963	2026-05-02 18:58:35.68	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopgerj00121logf24knta8	Oba	SAIDA	228.09	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 18:58:50.431	2026-05-02 18:58:52.556	cmnum8pui000037p8x9fwhlqj	cmnumonnl00031zmmg3v4zqc0	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	t
cmoopl03y00131logi4hyerh2	Lava Rapido	SAIDA	60	2026-05-02 15:00:00	PARCELADO	CREDITO		MANUAL	1	1	2026-05-02 19:02:24.718	2026-05-02 19:02:27.844	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	cmnunhc7c00071zmmntub3e5e	\N	f	\N	\N	t
cmoopovbi00141logyj2enc4o	Luz	SAIDA	233.15	2026-05-13 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-05-02 19:05:25.134	2026-05-02 19:05:25.134	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	\N	\N	f	cmnwerhkb00061lmm48yn067m	\N	f
cmoopt6g900151log6pma2c58	Água	SAIDA	227.7	2026-05-10 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-05-02 19:08:46.185	2026-05-02 19:08:46.185	cmnum8pui000037p8x9fwhlqj	cmnuookln001f1zmmo3a3g9u9	\N	\N	\N	f	cmnwet5zo00071lmmnpkxr1dp	\N	f
cmooq2z3p00161logjgt4h0yp	Financiamento carro	SAIDA	2563.09	2026-05-02 00:00:00	PAGO	PIX	\N	MANUAL	\N	\N	2026-05-02 19:16:23.221	2026-05-02 19:16:23.221	cmnum8pui000037p8x9fwhlqj	cmnupctdm00221zmm0mhhkb70	\N	\N	\N	f	cmnwe32ym00021lmmfrq9ywgm	\N	f
cmooq3atq00171logbxoeenv4	Pagamento fatura Nunbank PJ — Maio de 2026	ENTRADA	7648.16	2026-05-01 00:00:00	PAGO	PIX	Ref: 2026-05	MANUAL	\N	\N	2026-05-02 19:16:38.414	2026-05-02 19:16:38.414	cmnum8pui000037p8x9fwhlqj	\N	\N	cmnumvklh00041zmm0z2b1nyh	\N	f	\N	\N	f
cmooq3nci00181logrhrr21j1	Pagamento fatura Nubank Fisica — Maio de 2026	ENTRADA	153.32	2026-05-01 00:00:00	PAGO	PIX	Ref: 2026-05	MANUAL	\N	\N	2026-05-02 19:16:54.642	2026-05-02 19:16:54.642	cmnum8pui000037p8x9fwhlqj	\N	\N	cmnunhc7c00071zmmntub3e5e	\N	f	\N	\N	f
cmooq5ylb00191logojrpbva4	Pagamento fatura C6 — Maio de 2026	ENTRADA	4369.36	2026-05-01 00:00:00	PAGO	PIX	Ref: 2026-05	MANUAL	\N	\N	2026-05-02 19:18:42.527	2026-05-02 19:18:42.527	cmnum8pui000037p8x9fwhlqj	\N	\N	cmnun7a5200061zmmdc95to1d	\N	f	\N	\N	f
cmooqr8hr001a1logt8ru2jh2	Recebimento — Inês	ENTRADA	331.3	2026-05-02 19:35:12.028	PAGO	PIX		MANUAL	\N	\N	2026-05-02 19:35:15.135	2026-05-02 19:35:15.135	cmnum8pui000037p8x9fwhlqj	\N	\N	\N	cmo7egtz100161lmmzm08pbxb	f	\N	\N	f
cmooqxdtm001d1logqxbmoq9v	Empréstimo — Eduardo	SAIDA	1150	2026-05-02 19:40:01.976	PAGO	PIX	\N	MANUAL	\N	\N	2026-05-02 19:40:01.978	2026-05-02 19:40:01.978	cmnum8pui000037p8x9fwhlqj	\N	\N	\N	cmooqxdt6001c1loghlx5izob	f	\N	\N	f
cmoor37gg001e1logm266fmtm	Recarga bilete unico	SAIDA	25	2026-05-02 19:43:50.913	PAGO	PIX		MANUAL	\N	\N	2026-05-02 19:44:33.664	2026-05-02 19:44:33.664	cmnum8pui000037p8x9fwhlqj	cmnunqni0000g1zmminezkdjc	\N	\N	\N	f	\N	\N	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password, "createdAt", "updatedAt", phone) FROM stdin;
cmnum8pui000037p8x9fwhlqj	Isabella	admin@fincontrol.app	$2b$12$CvPlzN27ZL94phWC8fgZoObEnuQH/iBz8Ng3ENaUZEnx65g9ZgDo6	2026-04-11 17:35:47.419	2026-04-11 17:35:47.419	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: alertas alertas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_pkey PRIMARY KEY (id);


--
-- Name: cartoes cartoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cartoes
    ADD CONSTRAINT cartoes_pkey PRIMARY KEY (id);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: contas_fixas contas_fixas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contas_fixas
    ADD CONSTRAINT contas_fixas_pkey PRIMARY KEY (id);


--
-- Name: dividas_proprias dividas_proprias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dividas_proprias
    ADD CONSTRAINT dividas_proprias_pkey PRIMARY KEY (id);


--
-- Name: dividas_terceiros dividas_terceiros_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dividas_terceiros
    ADD CONSTRAINT dividas_terceiros_pkey PRIMARY KEY (id);


--
-- Name: metas metas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metas
    ADD CONSTRAINT metas_pkey PRIMARY KEY (id);


--
-- Name: orcamentos orcamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orcamentos
    ADD CONSTRAINT orcamentos_pkey PRIMARY KEY (id);


--
-- Name: subcategorias subcategorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategorias
    ADD CONSTRAINT subcategorias_pkey PRIMARY KEY (id);


--
-- Name: transacoes transacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT transacoes_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: orcamentos_userId_categoriaId_mesAno_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "orcamentos_userId_categoriaId_mesAno_key" ON public.orcamentos USING btree ("userId", "categoriaId", "mesAno");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: alertas alertas_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT "alertas_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cartoes cartoes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cartoes
    ADD CONSTRAINT "cartoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categorias categorias_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT "categorias_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contas_fixas contas_fixas_categoriaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contas_fixas
    ADD CONSTRAINT "contas_fixas_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES public.categorias(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: contas_fixas contas_fixas_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contas_fixas
    ADD CONSTRAINT "contas_fixas_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dividas_proprias dividas_proprias_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dividas_proprias
    ADD CONSTRAINT "dividas_proprias_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dividas_terceiros dividas_terceiros_cartaoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dividas_terceiros
    ADD CONSTRAINT "dividas_terceiros_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES public.cartoes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dividas_terceiros dividas_terceiros_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dividas_terceiros
    ADD CONSTRAINT "dividas_terceiros_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: metas metas_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metas
    ADD CONSTRAINT "metas_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orcamentos orcamentos_categoriaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orcamentos
    ADD CONSTRAINT "orcamentos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES public.categorias(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orcamentos orcamentos_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orcamentos
    ADD CONSTRAINT "orcamentos_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subcategorias subcategorias_categoriaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategorias
    ADD CONSTRAINT "subcategorias_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES public.categorias(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transacoes transacoes_cartaoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT "transacoes_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES public.cartoes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transacoes transacoes_categoriaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT "transacoes_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES public.categorias(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transacoes transacoes_contaFixaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT "transacoes_contaFixaId_fkey" FOREIGN KEY ("contaFixaId") REFERENCES public.contas_fixas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transacoes transacoes_dividaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT "transacoes_dividaId_fkey" FOREIGN KEY ("dividaId") REFERENCES public.dividas_terceiros(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transacoes transacoes_dividaPropiaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT "transacoes_dividaPropiaId_fkey" FOREIGN KEY ("dividaPropiaId") REFERENCES public.dividas_proprias(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transacoes transacoes_subcategoriaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT "transacoes_subcategoriaId_fkey" FOREIGN KEY ("subcategoriaId") REFERENCES public.subcategorias(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transacoes transacoes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT "transacoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict gB99fj6vuxARIdaxsfEwzG0STnzlX69rB4A52COU3CNKhI5cwD6Rx6700Af3VD3

