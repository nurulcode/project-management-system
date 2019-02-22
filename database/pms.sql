--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.14
-- Dumped by pg_dump version 9.5.14

-- Started on 2019-02-22 23:47:52 WIB

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 12395)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2208 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 189 (class 1259 OID 16459)
-- Name: tbl_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_activity (
    activityid integer NOT NULL,
    title character varying(100),
    description character varying(255),
    author integer,
    "time" timestamp without time zone DEFAULT now(),
    projectid integer
);


--
-- TOC entry 188 (class 1259 OID 16457)
-- Name: tbl_activity_activityid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tbl_activity_activityid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2209 (class 0 OID 0)
-- Dependencies: 188
-- Name: tbl_activity_activityid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tbl_activity_activityid_seq OWNED BY public.tbl_activity.activityid;


--
-- TOC entry 187 (class 1259 OID 16450)
-- Name: tbl_issues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_issues (
    projectid integer,
    tracker character varying,
    subject character varying(255) NOT NULL,
    description text,
    status character varying(50),
    assignee integer,
    startdate date,
    duedate date,
    done character varying(10),
    files character varying(100),
    targetversion character varying(100),
    crateddate date DEFAULT ('now'::text)::date NOT NULL,
    updateddate date,
    closedate date,
    issueid integer NOT NULL,
    priority character varying(50),
    estimatedtime real,
    spenttime real,
    author integer,
    parenttask integer
);


--
-- TOC entry 190 (class 1259 OID 16465)
-- Name: tbl_issues_issueid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tbl_issues_issueid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2210 (class 0 OID 0)
-- Dependencies: 190
-- Name: tbl_issues_issueid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tbl_issues_issueid_seq OWNED BY public.tbl_issues.issueid;


--
-- TOC entry 186 (class 1259 OID 16429)
-- Name: tbl_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_members (
    id integer NOT NULL,
    userid integer,
    projectid integer,
    role character varying(50) DEFAULT 'manager'::character varying NOT NULL
);


--
-- TOC entry 185 (class 1259 OID 16427)
-- Name: tbl_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tbl_members_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2211 (class 0 OID 0)
-- Dependencies: 185
-- Name: tbl_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tbl_members_id_seq OWNED BY public.tbl_members.id;


--
-- TOC entry 184 (class 1259 OID 16421)
-- Name: tbl_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_projects (
    projectid integer NOT NULL,
    name character varying(100)
);


--
-- TOC entry 183 (class 1259 OID 16419)
-- Name: tbl_projects_projectid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tbl_projects_projectid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2212 (class 0 OID 0)
-- Dependencies: 183
-- Name: tbl_projects_projectid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tbl_projects_projectid_seq OWNED BY public.tbl_projects.projectid;


--
-- TOC entry 182 (class 1259 OID 16410)
-- Name: tbl_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_users (
    userid integer NOT NULL,
    email character varying(255),
    password character varying(255),
    firstname character varying(50),
    lastname character varying(50),
    type integer DEFAULT 0,
    role character varying(50) DEFAULT 'manager'::character varying NOT NULL,
    options_project json DEFAULT '{"opsi1": true, "opsi2": true, "opsi3":false}'::json NOT NULL,
    status character varying(50) DEFAULT "current_user"() NOT NULL
);


--
-- TOC entry 2213 (class 0 OID 0)
-- Dependencies: 182
-- Name: COLUMN tbl_users.password; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tbl_users.password IS '	';


--
-- TOC entry 181 (class 1259 OID 16408)
-- Name: tbl_users_userid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tbl_users_userid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2214 (class 0 OID 0)
-- Dependencies: 181
-- Name: tbl_users_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tbl_users_userid_seq OWNED BY public.tbl_users.userid;


--
-- TOC entry 2055 (class 2604 OID 16462)
-- Name: activityid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_activity ALTER COLUMN activityid SET DEFAULT nextval('public.tbl_activity_activityid_seq'::regclass);


--
-- TOC entry 2053 (class 2604 OID 16467)
-- Name: issueid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_issues ALTER COLUMN issueid SET DEFAULT nextval('public.tbl_issues_issueid_seq'::regclass);


--
-- TOC entry 2051 (class 2604 OID 16432)
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_members ALTER COLUMN id SET DEFAULT nextval('public.tbl_members_id_seq'::regclass);


--
-- TOC entry 2050 (class 2604 OID 16424)
-- Name: projectid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_projects ALTER COLUMN projectid SET DEFAULT nextval('public.tbl_projects_projectid_seq'::regclass);


--
-- TOC entry 2045 (class 2604 OID 16413)
-- Name: userid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_users ALTER COLUMN userid SET DEFAULT nextval('public.tbl_users_userid_seq'::regclass);


--
-- TOC entry 2198 (class 0 OID 16459)
-- Dependencies: 189
-- Data for Name: tbl_activity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tbl_activity (activityid, title, description, author, "time", projectid) FROM stdin;
2	New Issue :8:14:58 pm ARTIKEL bug #2 new	Kurang 	1	2019-02-20 20:14:58.783696	2
3	Update Issue :8:16:57 pm ARTIKEL bug #9 in progress	Lumayan	1	2019-02-20 20:16:57.338538	2
5	New Issue :2:08:47 pm MENU LOGIN bug #11 new	Jangan menyerah sebelum lelah	1	2019-02-21 14:08:47.881655	2
6	Update Issue :1:17:35 am Login support #8 in progress	Tambah Remember Me  	1	2019-02-22 01:17:35.421924	2
4	New Issue :2:06:54 pm Input bug #11 new	Kurang sesuai expetasi, jangan tanya	1	2019-02-21 14:06:54.580546	2
7	New Issue :1:51:38 am  bug #12 in progress		1	2019-02-22 01:51:38.286431	21
8	Update Issue :1:58:28 am undefined undefined #11 undefined	undefined	1	2019-02-22 01:58:28.867358	2
9	Delete Issue :1:59:33 am undefined undefined #8 undefined	undefined	1	2019-02-22 01:59:33.61671	2
10	Update Issue :6:41:30 am Subject bug #undefined new		1	2019-02-22 06:41:30.504716	2
11	Update Issue :6:59:34 am ARTIKEL bug #9 in progress	Lumayan 	1	2019-02-22 06:59:34.677354	2
12	Update Issue :7:15:13 am Input bug #10 new	 Kurang sesuai expetasi, jangan tanya 	1	2019-02-22 07:15:13.207651	2
13	Update Issue :7:52:42 am ARTIKEL feature #9 in progress	 Lumayan  	1	2019-02-22 07:52:42.150485	2
14	Update Issue :4:47:07 pm Input bug #10 new	Kurang sesuai expetasi, jangan tanya  	1	2019-02-22 16:47:07.619859	2
\.


--
-- TOC entry 2215 (class 0 OID 0)
-- Dependencies: 188
-- Name: tbl_activity_activityid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tbl_activity_activityid_seq', 14, true);


--
-- TOC entry 2196 (class 0 OID 16450)
-- Dependencies: 187
-- Data for Name: tbl_issues; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tbl_issues (projectid, tracker, subject, description, status, assignee, startdate, duedate, done, files, targetversion, crateddate, updateddate, closedate, issueid, priority, estimatedtime, spenttime, author, parenttask) FROM stdin;
21	bug			in progress	1	2019-02-20	2019-02-28	2	\N	\N	2019-02-22	\N	\N	12	high	12	5	\N	\N
2	bug	Subject		new	1	2019-02-22	2019-02-28	2	1550792490360screenshot from 2019-02-11 22-16-53.png	\N	2019-02-22	\N	\N	13	normal	2	5	\N	\N
2	feature	ARTIKEL	 Lumayan  	in progress	3	2019-02-20	2019-02-28	2	1550793574554screenshot from 2019-02-11 22-16-53.png	ver 5	2019-02-20	2019-02-22	\N	9	high	4.5	5	1	9
2	bug	Input	Kurang sesuai expetasi, jangan tanya  	new	1	2019-02-21	2019-02-28	1	1550794513155screenshot from 2019-02-11 22-16-53.png	ver 5	2019-02-21	2019-02-22	2019-02-22	10	high	2	5	1	10
\.


--
-- TOC entry 2216 (class 0 OID 0)
-- Dependencies: 190
-- Name: tbl_issues_issueid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tbl_issues_issueid_seq', 13, true);


--
-- TOC entry 2195 (class 0 OID 16429)
-- Dependencies: 186
-- Data for Name: tbl_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tbl_members (id, userid, projectid, role) FROM stdin;
25	1	22	manager
26	3	22	manager
52	2	21	manager
53	1	21	manager
56	3	23	manager
60	1	24	manager
61	2	25	manager
62	3	26	manager
66	\N	31	manager
71	1	2	manager
72	2	2	manager
\.


--
-- TOC entry 2217 (class 0 OID 0)
-- Dependencies: 185
-- Name: tbl_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tbl_members_id_seq', 72, true);


--
-- TOC entry 2193 (class 0 OID 16421)
-- Dependencies: 184
-- Data for Name: tbl_projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tbl_projects (projectid, name) FROM stdin;
2	LMS
21	SIMRS RSU MKW
22	SIAKAD
23	PROJEK AKHIR
24	KOTAK MAKAN
25	CMS
26	SIMDA
27	APAAN SIH
28	Keuangan
31	Keuangan
\.


--
-- TOC entry 2218 (class 0 OID 0)
-- Dependencies: 183
-- Name: tbl_projects_projectid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tbl_projects_projectid_seq', 31, true);


--
-- TOC entry 2191 (class 0 OID 16410)
-- Dependencies: 182
-- Data for Name: tbl_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tbl_users (userid, email, password, firstname, lastname, type, role, options_project, status) FROM stdin;
2	rubicamp@gmail.com	12345	Tina	Hidayat	0	manager	{"opsi1": true, "opsi2": true, "opsi3":false}	postgres
3	papuatampan@gmail.com	12345	Haftittah	Hidayat	1	manager	{"opsi1": true, "opsi2": true, "opsi3":false}	postgres
4	tambahsatu@gmail.com	12345	Tambah	Satu	1	manager	{"opsi1": true, "opsi2": true, "opsi3":false}	postgres
5	tambahdua@gmail.com	12345	Dua	Dua	0	manager	{"opsi1": true, "opsi2": true, "opsi3":false}	postgres
1	tangituru@gmail.com	12345	Nurul	Hidayat	1	manager	{"opsi1": true, "opsi2": true, "opsi3": true}	super user
\.


--
-- TOC entry 2219 (class 0 OID 0)
-- Dependencies: 181
-- Name: tbl_users_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tbl_users_userid_seq', 5, true);


--
-- TOC entry 2069 (class 2606 OID 16464)
-- Name: tbl_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_activity
    ADD CONSTRAINT tbl_activity_pkey PRIMARY KEY (activityid);


--
-- TOC entry 2066 (class 2606 OID 16483)
-- Name: tbl_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_issues
    ADD CONSTRAINT tbl_issues_pkey PRIMARY KEY (issueid);


--
-- TOC entry 2062 (class 2606 OID 16437)
-- Name: tbl_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_members
    ADD CONSTRAINT tbl_members_pkey PRIMARY KEY (id);


--
-- TOC entry 2060 (class 2606 OID 16426)
-- Name: tbl_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_projects
    ADD CONSTRAINT tbl_projects_pkey PRIMARY KEY (projectid);


--
-- TOC entry 2058 (class 2606 OID 16418)
-- Name: tbl_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_users
    ADD CONSTRAINT tbl_users_pkey PRIMARY KEY (userid);


--
-- TOC entry 2063 (class 1259 OID 24722)
-- Name: fki_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fki_author ON public.tbl_issues USING btree (author);


--
-- TOC entry 2064 (class 1259 OID 24728)
-- Name: fki_parenttask; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fki_parenttask ON public.tbl_issues USING btree (parenttask);


--
-- TOC entry 2067 (class 1259 OID 32927)
-- Name: fki_projectid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fki_projectid ON public.tbl_activity USING btree (projectid);


--
-- TOC entry 2074 (class 2606 OID 24717)
-- Name: author; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_issues
    ADD CONSTRAINT author FOREIGN KEY (author) REFERENCES public.tbl_users(userid);


--
-- TOC entry 2075 (class 2606 OID 32922)
-- Name: projectid; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_activity
    ADD CONSTRAINT projectid FOREIGN KEY (projectid) REFERENCES public.tbl_projects(projectid);


--
-- TOC entry 2073 (class 2606 OID 16484)
-- Name: tbl_issues_assignee_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_issues
    ADD CONSTRAINT tbl_issues_assignee_fkey FOREIGN KEY (assignee) REFERENCES public.tbl_users(userid);


--
-- TOC entry 2072 (class 2606 OID 16477)
-- Name: tbl_issues_projectid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_issues
    ADD CONSTRAINT tbl_issues_projectid_fkey FOREIGN KEY (projectid) REFERENCES public.tbl_projects(projectid);


--
-- TOC entry 2070 (class 2606 OID 16438)
-- Name: tbl_members_projectid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_members
    ADD CONSTRAINT tbl_members_projectid_fkey FOREIGN KEY (projectid) REFERENCES public.tbl_projects(projectid);


--
-- TOC entry 2071 (class 2606 OID 16443)
-- Name: tbl_members_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_members
    ADD CONSTRAINT tbl_members_userid_fkey FOREIGN KEY (userid) REFERENCES public.tbl_users(userid);


--
-- TOC entry 2207 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2019-02-22 23:47:53 WIB

--
-- PostgreSQL database dump complete
--

