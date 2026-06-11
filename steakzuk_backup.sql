--
-- PostgreSQL database dump
--

\restrict dm6EDVR7enDH317nVoL9IoloKxbdaoKKqc9QgPKRd5jJUlTRWRWl5b73F5dX6rS

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_branchId_fkey";
ALTER TABLE ONLY public."Table" DROP CONSTRAINT "Table_branchId_fkey";
ALTER TABLE ONLY public."Reservation" DROP CONSTRAINT "Reservation_tableId_fkey";
ALTER TABLE ONLY public."Reservation" DROP CONSTRAINT "Reservation_customerId_fkey";
ALTER TABLE ONLY public."Reservation" DROP CONSTRAINT "Reservation_branchId_fkey";
ALTER TABLE ONLY public."RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";
ALTER TABLE ONLY public."Receipt" DROP CONSTRAINT "Receipt_uploadedById_fkey";
ALTER TABLE ONLY public."Receipt" DROP CONSTRAINT "Receipt_branchId_fkey";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_orderId_fkey";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_waiterId_fkey";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_tableId_fkey";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_customerId_fkey";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_branchId_fkey";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_basketId_fkey";
ALTER TABLE ONLY public."OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";
ALTER TABLE ONLY public."OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";
ALTER TABLE ONLY public."Notification" DROP CONSTRAINT "Notification_userId_fkey";
ALTER TABLE ONLY public."MenuItem" DROP CONSTRAINT "MenuItem_categoryId_fkey";
ALTER TABLE ONLY public."Inventory" DROP CONSTRAINT "Inventory_branchId_fkey";
ALTER TABLE ONLY public."InventoryTransaction" DROP CONSTRAINT "InventoryTransaction_inventoryId_fkey";
ALTER TABLE ONLY public."Campaign" DROP CONSTRAINT "Campaign_createdById_fkey";
ALTER TABLE ONLY public."Campaign" DROP CONSTRAINT "Campaign_branchId_fkey";
ALTER TABLE ONLY public."Basket" DROP CONSTRAINT "Basket_customerId_fkey";
ALTER TABLE ONLY public."Basket" DROP CONSTRAINT "Basket_branchId_fkey";
ALTER TABLE ONLY public."BasketItem" DROP CONSTRAINT "BasketItem_menuItemId_fkey";
ALTER TABLE ONLY public."BasketItem" DROP CONSTRAINT "BasketItem_basketId_fkey";
DROP INDEX public."User_employeeId_key";
DROP INDEX public."User_email_key";
DROP INDEX public."RefreshToken_token_key";
DROP INDEX public."Payment_orderId_key";
DROP INDEX public."Order_basketId_key";
DROP INDEX public."NewsletterSubscription_email_key";
DROP INDEX public."Inventory_branchId_idx";
DROP INDEX public."Branch_name_key";
DROP INDEX public."Branch_email_key";
ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
ALTER TABLE ONLY public."Table" DROP CONSTRAINT "Table_pkey";
ALTER TABLE ONLY public."Reservation" DROP CONSTRAINT "Reservation_pkey";
ALTER TABLE ONLY public."RefreshToken" DROP CONSTRAINT "RefreshToken_pkey";
ALTER TABLE ONLY public."Receipt" DROP CONSTRAINT "Receipt_pkey";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_pkey";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_pkey";
ALTER TABLE ONLY public."OrderItem" DROP CONSTRAINT "OrderItem_pkey";
ALTER TABLE ONLY public."Notification" DROP CONSTRAINT "Notification_pkey";
ALTER TABLE ONLY public."NewsletterSubscription" DROP CONSTRAINT "NewsletterSubscription_pkey";
ALTER TABLE ONLY public."MenuItem" DROP CONSTRAINT "MenuItem_pkey";
ALTER TABLE ONLY public."MenuCategory" DROP CONSTRAINT "MenuCategory_pkey";
ALTER TABLE ONLY public."Inventory" DROP CONSTRAINT "Inventory_pkey";
ALTER TABLE ONLY public."InventoryTransaction" DROP CONSTRAINT "InventoryTransaction_pkey";
ALTER TABLE ONLY public."Campaign" DROP CONSTRAINT "Campaign_pkey";
ALTER TABLE ONLY public."Branch" DROP CONSTRAINT "Branch_pkey";
ALTER TABLE ONLY public."Basket" DROP CONSTRAINT "Basket_pkey";
ALTER TABLE ONLY public."BasketItem" DROP CONSTRAINT "BasketItem_pkey";
ALTER TABLE ONLY public."AuditLog" DROP CONSTRAINT "AuditLog_pkey";
DROP TABLE public._prisma_migrations;
DROP TABLE public."User";
DROP TABLE public."Table";
DROP TABLE public."Reservation";
DROP TABLE public."RefreshToken";
DROP TABLE public."Receipt";
DROP TABLE public."Payment";
DROP TABLE public."OrderItem";
DROP TABLE public."Order";
DROP TABLE public."Notification";
DROP TABLE public."NewsletterSubscription";
DROP TABLE public."MenuItem";
DROP TABLE public."MenuCategory";
DROP TABLE public."InventoryTransaction";
DROP TABLE public."Inventory";
DROP TABLE public."Campaign";
DROP TABLE public."Branch";
DROP TABLE public."BasketItem";
DROP TABLE public."Basket";
DROP TABLE public."AuditLog";
DROP TYPE public."TransactionType";
DROP TYPE public."TableStatus";
DROP TYPE public."Shift";
DROP TYPE public."Role";
DROP TYPE public."ReservationStatus";
DROP TYPE public."PaymentStatus";
DROP TYPE public."PaymentMethod";
DROP TYPE public."OrderStatus";
DROP TYPE public."NotificationType";
DROP TYPE public."EmployeeStatus";
DROP TYPE public."CampaignStatus";
DROP TYPE public."BasketStatus";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: BasketStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BasketStatus" AS ENUM (
    'ACTIVE',
    'CHECKED_OUT',
    'ABANDONED'
);


--
-- Name: CampaignStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CampaignStatus" AS ENUM (
    'DRAFT',
    'SCHEDULED',
    'SENT',
    'CANCELLED'
);


--
-- Name: EmployeeStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmployeeStatus" AS ENUM (
    'ACTIVE',
    'ON_LEAVE',
    'TERMINATED'
);


--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ORDER_UPDATE',
    'RESERVATION_UPDATE',
    'PAYMENT_RECEIVED',
    'CAMPAIGN',
    'SYSTEM'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PREPARING',
    'READY',
    'SERVED',
    'COMPLETED',
    'CANCELLED',
    'DELIVERED',
    'PAID',
    'ON_TABLE'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CARD',
    'CONTACTLESS'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);


--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED',
    'SEATED',
    'CHECKED_IN',
    'NO_SHOW'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'CUSTOMER',
    'WAITER_CASHIER',
    'CHEF',
    'KITCHEN_ASSISTANT',
    'BRANCH_MANAGER',
    'HQ_MANAGER',
    'ADMIN'
);


--
-- Name: Shift; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Shift" AS ENUM (
    'MORNING',
    'AFTERNOON',
    'EVENING',
    'NIGHT',
    'FLEXIBLE'
);


--
-- Name: TableStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TableStatus" AS ENUM (
    'AVAILABLE',
    'OCCUPIED',
    'RESERVED',
    'MAINTENANCE',
    'PAYMENT_PENDING'
);


--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransactionType" AS ENUM (
    'IN',
    'OUT',
    'ADJUSTMENT'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    "userName" text,
    action text NOT NULL,
    resource text NOT NULL,
    "resourceId" text,
    details text,
    "ipAddress" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Basket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Basket" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "branchId" text NOT NULL,
    status public."BasketStatus" DEFAULT 'ACTIVE'::public."BasketStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BasketItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BasketItem" (
    id text NOT NULL,
    "basketId" text NOT NULL,
    "menuItemId" text NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL
);


--
-- Name: Branch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Branch" (
    id text NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL
);


--
-- Name: Campaign; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Campaign" (
    id text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "targetAudience" text DEFAULT 'ALL'::text NOT NULL,
    "branchId" text,
    status public."CampaignStatus" DEFAULT 'DRAFT'::public."CampaignStatus" NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Inventory" (
    id text NOT NULL,
    "branchId" text NOT NULL,
    name text NOT NULL,
    quantity integer NOT NULL,
    "minimumStock" integer NOT NULL,
    unit text DEFAULT 'serving'::text NOT NULL,
    category text
);


--
-- Name: InventoryTransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InventoryTransaction" (
    id text NOT NULL,
    "inventoryId" text NOT NULL,
    quantity integer NOT NULL,
    "transactionType" public."TransactionType" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: MenuCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MenuCategory" (
    id text NOT NULL,
    name text NOT NULL
);


--
-- Name: MenuItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MenuItem" (
    id text NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    "imageUrl" text,
    "isAvailable" boolean DEFAULT true NOT NULL
);


--
-- Name: NewsletterSubscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NewsletterSubscription" (
    id text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name text
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" DEFAULT 'SYSTEM'::public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    link text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "branchId" text NOT NULL,
    "tableId" text,
    "waiterId" text,
    "basketId" text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "customerId" text
);


--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "menuItemId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL
);


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Receipt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Receipt" (
    id text NOT NULL,
    "orderId" text,
    "branchId" text NOT NULL,
    "uploadedById" text NOT NULL,
    filename text NOT NULL,
    "mimeType" text NOT NULL,
    data text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Reservation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Reservation" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "branchId" text NOT NULL,
    "tableId" text NOT NULL,
    "reservationDate" timestamp(3) without time zone NOT NULL,
    "partySize" integer NOT NULL,
    status public."ReservationStatus" DEFAULT 'PENDING'::public."ReservationStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Table; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Table" (
    id text NOT NULL,
    "branchId" text NOT NULL,
    "tableNumber" integer NOT NULL,
    capacity integer NOT NULL,
    status public."TableStatus" DEFAULT 'AVAILABLE'::public."TableStatus" NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    "branchId" text,
    "employeeId" text,
    salary numeric(10,2),
    shift public."Shift",
    "employeeStatus" public."EmployeeStatus",
    "dateJoined" timestamp(3) without time zone,
    "teamAssignment" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


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
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "userId", "userName", action, resource, "resourceId", details, "ipAddress", "createdAt") FROM stdin;
cmq3nuw6i000p7dw1kljjpcug	cmq118y1o006vcuonry5z7sgx	System	STAFF_STATUS_UPDATED	User	cmq11913s0073cuon10qn5b91	Status changed to ON_LEAVE for kitchen.london@steakz.co.uk	\N	2026-06-07 10:50:21.93
cmq3sadjw0002gxgo3p3k6kkb	cmq118wjr006rcuonhrh7mqpj	System	USER_DELETED	User	cmq3nqsqz00087dw1y5x1konp	Deleted rudom@gmail.com	\N	2026-06-07 12:54:22.748
cmq3sdhqf000pgxgod3r57dih	cmq118vvn006pcuonlwldds1o	System	RESERVATION_CREATED	Reservation	cmq3sdgo4000igxgopo03ik2x	Party of 2 at Manchester on 2026-06-13T11:30:00.000Z	\N	2026-06-07 12:56:48.136
cmq3sfygz000sgxgon4icj2rc	cmq1191tt0075cuonf80qee5m	System	STAFF_STATUS_UPDATED	User	cmq1194q5007dcuonovtbc3st	Status changed to ON_LEAVE for kitchen.manchester@steakz.co.uk	\N	2026-06-07 12:58:43.139
cmq429d1900049eoab7lc53gn	cmq118wjr006rcuonhrh7mqpj	System	USER_DELETED	User	cmq19yd8b000e9ezbcmmy56ub	Deleted john@gmail.com	\N	2026-06-07 17:33:31.58
cmq42apuy00079eoafghgpjhx	cmq118vvn006pcuonlwldds1o	System	RESERVATION_CANCELLED	Reservation	cmq324bnb00e512paw0h5c0xx	Reservation cancelled at Manchester	\N	2026-06-07 17:34:34.858
cmq46jgk5000wkwozzi2r9ew2	cmq118wjr006rcuonhrh7mqpj	System	USER_CREATED	User	cmq46jgfx000vkwozrcrzata6	Created john@gmail.com with role KITCHEN_ASSISTANT	\N	2026-06-07 19:33:21.173
cmq46jqy2000xkwozuphbsifh	cmq118wjr006rcuonhrh7mqpj	System	USER_DELETED	User	cmq46jgfx000vkwozrcrzata6	Deleted john@gmail.com	\N	2026-06-07 19:33:34.634
cmq46kntl0010kwoz4slwm0gu	cmq118wjr006rcuonhrh7mqpj	System	USER_CREATED	User	cmq46knmk000zkwoz4rudu7zn	Created john@gmail.com with role KITCHEN_ASSISTANT	\N	2026-06-07 19:34:17.241
cmq46kvdj0011kwozpwr0tgzp	cmq118wjr006rcuonhrh7mqpj	System	USER_DELETED	User	cmq46knmk000zkwoz4rudu7zn	Deleted john@gmail.com	\N	2026-06-07 19:34:27.032
cmq47wctz000612zsyzz8vljl	cmq118y1o006vcuonry5z7sgx	System	STAFF_STATUS_UPDATED	User	cmq11913s0073cuon10qn5b91	Status changed to ACTIVE for kitchen.london@steakz.co.uk	\N	2026-06-07 20:11:22.487
cmq481bwr000b12zsaai2hrwr	cmq118vvn006pcuonlwldds1o	System	RESERVATION_CANCELLED	Reservation	cmq324by300it12pazf97uiad	Reservation cancelled at Birmingham	\N	2026-06-07 20:15:14.572
cmq49j0ll000avmsjyfhng1mw	cmq118vvn006pcuonlwldds1o	System	RESERVATION_CREATED	Reservation	cmq49izyc0003vmsjea1jmfff	Party of 4 at Manchester on 2026-06-08T18:00:00.000Z	\N	2026-06-07 20:56:59.337
cmq49mgk7000mvmsjmexukur1	cmq1191tt0075cuonf80qee5m	System	STAFF_STATUS_UPDATED	User	cmq1194q5007dcuonovtbc3st	Status changed to ACTIVE for kitchen.manchester@steakz.co.uk	\N	2026-06-07 20:59:39.991
cmq4cxmsg000h2y1sfqnjqwy6	cmq118vvn006pcuonlwldds1o	System	RESERVATION_CREATED	Reservation	cmq4cxmov000c2y1sgcerr713	Party of 4 at Manchester on 2026-06-08T10:30:00.000Z	\N	2026-06-07 22:32:20.128
cmq4etcyj00023vhii2fh4lyo	cmq118vvn006pcuonlwldds1o	System	RESERVATION_CANCELLED	Reservation	cmq4cxmov000c2y1sgcerr713	Reservation cancelled at Manchester	\N	2026-06-07 23:24:59.995
cmq4etq5f000a3vhitf93ps6o	cmq118vvn006pcuonlwldds1o	System	RESERVATION_CREATED	Reservation	cmq4etq4h00043vhiqfjvvycj	Party of 6 at Manchester on 2026-06-08T18:00:00.000Z	\N	2026-06-07 23:25:17.092
cmq4zx5aw000tyb4y3yqfxbsm	cmq118wjr006rcuonhrh7mqpj	System	USER_DELETED	User	cmq4zx3bi000qyb4y53qjmqw0	Deleted testdelete@steakz.co.uk	\N	2026-06-08 09:15:48.632
cmq50zspd000ckjudeyzle7uk	cmq1191tt0075cuonf80qee5m	System	STAFF_STATUS_UPDATED	User	cmq1194q5007dcuonovtbc3st	Status changed to ON_LEAVE for kitchen.manchester@steakz.co.uk	\N	2026-06-08 09:45:51.889
cmq50zv19000dkjudrb7sh03b	cmq1191tt0075cuonf80qee5m	System	STAFF_STATUS_UPDATED	User	cmq1194q5007dcuonovtbc3st	Status changed to ACTIVE for kitchen.manchester@steakz.co.uk	\N	2026-06-08 09:45:54.91
cmq7a6xel001qz1m1cbwm727x	cmq118wjr006rcuonhrh7mqpj	System	USER_CREATED	User	cmq7a6xdw001pz1m1jbnmxr95	Created john@gmail.com with role KITCHEN_ASSISTANT	\N	2026-06-09 23:38:53.469
cmq7a7ahf001rz1m1un4ugydn	cmq118wjr006rcuonhrh7mqpj	System	USER_DELETED	User	cmq7a6xdw001pz1m1jbnmxr95	Deleted john@gmail.com	\N	2026-06-09 23:39:10.42
cmq7a9jrp001wz1m1unauqe7v	cmq118vvn006pcuonlwldds1o	System	RESERVATION_CANCELLED	Reservation	cmq324bs400gh12pa5t4cnpq4	Reservation cancelled at Leeds	\N	2026-06-09 23:40:55.766
cmq7aaq3a0024z1m1wgpo4zmj	cmq118vvn006pcuonlwldds1o	System	RESERVATION_CREATED	Reservation	cmq7aaq27001yz1m1irewit8n	Party of 6 at London on 2026-06-11T18:00:00.000Z	\N	2026-06-09 23:41:50.614
\.


--
-- Data for Name: Basket; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Basket" (id, "customerId", "branchId", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BasketItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BasketItem" (id, "basketId", "menuItemId", quantity, price, subtotal) FROM stdin;
\.


--
-- Data for Name: Branch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Branch" (id, name, location, phone, email) FROM stdin;
cmq118upo0000cuonozp6ur0p	London	London, EC1A 1BB	+44 20 1234 5678	london@steakz.co.uk
cmq118uq30001cuonmbe5ypw9	Manchester	Manchester, M1 1AA	+44 161 234 5678	manchester@steakz.co.uk
cmq118uq60002cuonb0b9udoy	Leeds	Leeds, LS1 1AA	+44 113 234 5678	leeds@steakz.co.uk
cmq118uq90003cuonl9nim67p	Birmingham	Birmingham, B1 1AA	+44 121 234 5678	birmingham@steakz.co.uk
cmq118uqc0004cuonac33ndz8	Liverpool	Liverpool, L1 1AA	+44 151 234 5678	liverpool@steakz.co.uk
\.


--
-- Data for Name: Campaign; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Campaign" (id, title, message, "targetAudience", "branchId", status, "sentAt", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Inventory" (id, "branchId", name, quantity, "minimumStock", unit, category) FROM stdin;
cmq118uyo004ncuon30ogeyd0	cmq118upo0000cuonozp6ur0p	Chips (kg)	100	20	serving	Side Dishes
cmq118uzs0055cuon2ixm11cy	cmq118uq30001cuonmbe5ypw9	Chips (kg)	100	20	serving	Side Dishes
cmq118uyh004kcuonvb5xskst	cmq118upo0000cuonozp6ur0p	Bread Rolls (bag of 50)	15	3	serving	Side Dishes
cmq118uzm0052cuonrb96oxch	cmq118uq30001cuonmbe5ypw9	Bread Rolls (bag of 50)	15	3	serving	Side Dishes
cmq323srx008712pa0kn3rap4	cmq118upo0000cuonozp6ur0p	Bread Rolls	500	50	serving	Side Dishes
cmq118v0b005ecuonp001bt9l	cmq118uq60002cuonb0b9udoy	Beef Fillet (kg)	30	5	serving	Main Meals
cmq118v1l005wcuon3lrem8r9	cmq118uq90003cuonl9nim67p	Beef Fillet (kg)	30	5	serving	Main Meals
cmq118v2z006ecuonnklbnc55	cmq118uqc0004cuonac33ndz8	Beef Fillet (kg)	30	5	serving	Main Meals
cmq118uy3004ecuonloblkmj3	cmq118upo0000cuonozp6ur0p	Beef Fillet (kg)	50	5	serving	Main Meals
cmq118v2i0068cuono1d8ok9b	cmq118uqc0004cuonac33ndz8	Ribeye Steak (kg)	49	10	serving	Main Meals
cmq118v0t005ncuonopzorv0m	cmq118uq60002cuonb0b9udoy	Chips (kg)	100	20	serving	Side Dishes
cmq118v270065cuono4dy5zdi	cmq118uq90003cuonl9nim67p	Chips (kg)	100	20	serving	Side Dishes
cmq118uxw004bcuonsdfvbnxd	cmq118upo0000cuonozp6ur0p	Sirloin Steak (kg)	47	8	serving	Main Meals
cmq118uz2004tcuon4928xuvw	cmq118uq30001cuonmbe5ypw9	Sirloin Steak (kg)	37	8	serving	Main Meals
cmq118uzy0058cuon7kydcs5n	cmq118uq60002cuonb0b9udoy	Ribeye Steak (kg)	50	10	serving	Main Meals
cmq118v3n006ncuonyqud1bm2	cmq118uqc0004cuonac33ndz8	Chips (kg)	100	20	serving	Side Dishes
cmq118v13005qcuontuav9rjp	cmq118uq90003cuonl9nim67p	Ribeye Steak (kg)	50	10	serving	Main Meals
cmq118v0n005kcuonkgbdvpsy	cmq118uq60002cuonb0b9udoy	Bread Rolls (bag of 50)	15	3	serving	Side Dishes
cmq118v210062cuonnym69c4z	cmq118uq90003cuonl9nim67p	Bread Rolls (bag of 50)	15	3	serving	Side Dishes
cmq118v3g006kcuonuezd4nfg	cmq118uqc0004cuonac33ndz8	Bread Rolls (bag of 50)	15	3	serving	Side Dishes
cmq323suz009g12pag8wsdpst	cmq118uq90003cuonl9nim67p	Bread Rolls	500	50	serving	Side Dishes
cmq118uyu004qcuon5xql61lw	cmq118uq30001cuonmbe5ypw9	Ribeye Steak (kg)	46	10	serving	Main Meals
cmq323sra007y12pacpqi1zb8	cmq118upo0000cuonozp6ur0p	Chicken Breast (kg)	500	50	serving	Main Meals
cmq323ssi008d12pa25jykmit	cmq118uq30001cuonmbe5ypw9	Chicken Breast (kg)	500	50	serving	Main Meals
cmq323ste008s12pa8lei8nj4	cmq118uq60002cuonb0b9udoy	Chicken Breast (kg)	500	50	serving	Main Meals
cmq323suf009712pab5hkle7u	cmq118uq90003cuonl9nim67p	Chicken Breast (kg)	500	50	serving	Main Meals
cmq323svh009m12pahfktz9uj	cmq118uqc0004cuonac33ndz8	Chicken Breast (kg)	500	50	serving	Main Meals
cmq118uya004hcuonll5vpivh	cmq118upo0000cuonozp6ur0p	Burger Patties (box of 24)	20	4	serving	Main Meals
cmq118uxl0048cuonzc16vs86	cmq118upo0000cuonozp6ur0p	Ribeye Steak (kg)	47	10	serving	Main Meals
cmq118uz8004wcuonstlsf0bx	cmq118uq30001cuonmbe5ypw9	Beef Fillet (kg)	58	5	serving	Main Meals
cmq323sw0009v12pau5t8277z	cmq118uqc0004cuonac33ndz8	Bread Rolls	500	50	serving	Side Dishes
cmq323ss6008a12pag20ovqc5	cmq118upo0000cuonozp6ur0p	Salad Mix (kg)	200	30	serving	Side Dishes
cmq323st7008p12pa77kryutd	cmq118uq30001cuonmbe5ypw9	Salad Mix (kg)	200	30	serving	Side Dishes
cmq323su6009412paq5hv1thm	cmq118uq60002cuonb0b9udoy	Salad Mix (kg)	200	30	serving	Side Dishes
cmq323sv7009j12patzwbedve	cmq118uq90003cuonl9nim67p	Salad Mix (kg)	200	30	serving	Side Dishes
cmq323sw5009y12par36q78mv	cmq118uqc0004cuonac33ndz8	Salad Mix (kg)	200	30	serving	Side Dishes
cmq323st0008m12paguxdfkqp	cmq118uq30001cuonmbe5ypw9	Bread Rolls	500	50	serving	Side Dishes
cmq323su1009112pas8vdlyae	cmq118uq60002cuonb0b9udoy	Bread Rolls	500	50	serving	Side Dishes
cmq118v05005bcuoni0lx5kwn	cmq118uq60002cuonb0b9udoy	Sirloin Steak (kg)	40	8	serving	Main Meals
cmq118v1c005tcuonrkmogtxf	cmq118uq90003cuonl9nim67p	Sirloin Steak (kg)	40	8	serving	Main Meals
cmq118v2o006bcuonyw9qjf42	cmq118uqc0004cuonac33ndz8	Sirloin Steak (kg)	40	8	serving	Main Meals
cmq118uzf004zcuonbmtlpzih	cmq118uq30001cuonmbe5ypw9	Burger Patties (box of 24)	20	4	serving	Main Meals
cmq118v0h005hcuon7e8ycali	cmq118uq60002cuonb0b9udoy	Burger Patties (box of 24)	20	4	serving	Main Meals
cmq323srr008412par3ll7hhc	cmq118upo0000cuonozp6ur0p	Soft Drinks (units)	500	100	bottle	Soft Drinks
cmq323ssv008j12pazn7fmia8	cmq118uq30001cuonmbe5ypw9	Soft Drinks (units)	500	100	bottle	Soft Drinks
cmq118v1u005zcuonfgs7n7s1	cmq118uq90003cuonl9nim67p	Burger Patties (box of 24)	20	4	serving	Main Meals
cmq118v36006hcuonaptcn1nu	cmq118uqc0004cuonac33ndz8	Burger Patties (box of 24)	20	4	serving	Main Meals
cmq323srj008112paxehmmjzh	cmq118upo0000cuonozp6ur0p	Burger Patties (box)	500	50	serving	Main Meals
cmq323ssp008g12pa731f4ptc	cmq118uq30001cuonmbe5ypw9	Burger Patties (box)	500	50	serving	Main Meals
cmq323stu008y12pawvcb5320	cmq118uq60002cuonb0b9udoy	Soft Drinks (units)	500	100	bottle	Soft Drinks
cmq323sus009d12pazhpw9bbd	cmq118uq90003cuonl9nim67p	Soft Drinks (units)	500	100	bottle	Soft Drinks
cmq323svu009s12pat4yp2q2a	cmq118uqc0004cuonac33ndz8	Soft Drinks (units)	500	100	bottle	Soft Drinks
cmq4cnp6d003aa3yq39wvel5h	cmq118uq90003cuonl9nim67p	Salad Mix	200	30	serving	Side Dishes
cmq4cnp6l003ca3yqn6bza7dk	cmq118uq90003cuonl9nim67p	Onion Rings	300	30	serving	Side Dishes
cmq4cnp6r003ea3yq65a5t7e7	cmq118uq90003cuonl9nim67p	Chocolate Brownie	200	20	serving	Desserts
cmq323stl008v12paog3xfarq	cmq118uq60002cuonb0b9udoy	Burger Patties (box)	500	50	serving	Main Meals
cmq323sul009a12pas659ib2n	cmq118uq90003cuonl9nim67p	Burger Patties (box)	500	50	serving	Main Meals
cmq323svm009p12pa7d4p0v53	cmq118uqc0004cuonac33ndz8	Burger Patties (box)	500	50	serving	Main Meals
cmq4cnoxe0008a3yq2jbkn2v6	cmq118upo0000cuonozp6ur0p	Ribeye Steak	500	50	serving	Main Meals
cmq4cnoxq000aa3yq173ex7ln	cmq118upo0000cuonozp6ur0p	Sirloin Steak	500	50	serving	Main Meals
cmq4cnoxv000ca3yq08o1lhsj	cmq118upo0000cuonozp6ur0p	Beef Fillet	500	50	serving	Main Meals
cmq4cnoy2000ea3yqs2hb3rao	cmq118upo0000cuonozp6ur0p	Chicken Breast	500	50	serving	Main Meals
cmq4cnoy9000ga3yqjpuee8io	cmq118upo0000cuonozp6ur0p	Burger Patties	500	50	serving	Main Meals
cmq4cnoyf000ia3yqj9nmnujg	cmq118upo0000cuonozp6ur0p	Chips	500	100	serving	Side Dishes
cmq4cnoyv000ma3yql7g68l8e	cmq118upo0000cuonozp6ur0p	Salad Mix	200	30	serving	Side Dishes
cmq4cnoz3000oa3yq61vsai87	cmq118upo0000cuonozp6ur0p	Onion Rings	300	30	serving	Side Dishes
cmq4cnoz9000qa3yqmtilplzh	cmq118upo0000cuonozp6ur0p	Chocolate Brownie	200	20	serving	Desserts
cmq4cnozf000sa3yqawmd38zq	cmq118upo0000cuonozp6ur0p	Cheesecake	200	20	serving	Desserts
cmq4cnozl000ua3yqxnbueajb	cmq118upo0000cuonozp6ur0p	Ice Cream	150	20	serving	Desserts
cmq4cnozq000wa3yqr3ikdf7c	cmq118upo0000cuonozp6ur0p	Soft Drinks	300	50	bottle	Soft Drinks
cmq4cnozu000ya3yqk87wnd6v	cmq118upo0000cuonozp6ur0p	Fruit Juice	200	30	bottle	Soft Drinks
cmq4cnozz0010a3yqn7rulcrt	cmq118upo0000cuonozp6ur0p	Still Water	300	50	bottle	Water
cmq4cnp040012a3yq2rcbb9pe	cmq118upo0000cuonozp6ur0p	Sparkling Water	200	30	bottle	Water
cmq4cnp090014a3yq4kwjo54x	cmq118uq30001cuonmbe5ypw9	Ribeye Steak	500	50	serving	Main Meals
cmq4cnp0e0016a3yq8cs1519z	cmq118uq30001cuonmbe5ypw9	Sirloin Steak	500	50	serving	Main Meals
cmq4cnp0k0018a3yq8ypuvodi	cmq118uq30001cuonmbe5ypw9	Beef Fillet	500	50	serving	Main Meals
cmq4cnp0p001aa3yq6ntyt408	cmq118uq30001cuonmbe5ypw9	Chicken Breast	500	50	serving	Main Meals
cmq4cnp0u001ca3yqlb7of3ir	cmq118uq30001cuonmbe5ypw9	Burger Patties	500	50	serving	Main Meals
cmq4cnp10001ea3yqb31irhje	cmq118uq30001cuonmbe5ypw9	Chips	500	100	serving	Side Dishes
cmq4cnp19001ia3yqard5wcqk	cmq118uq30001cuonmbe5ypw9	Salad Mix	200	30	serving	Side Dishes
cmq4cnp1f001ka3yq957jc05h	cmq118uq30001cuonmbe5ypw9	Onion Rings	300	30	serving	Side Dishes
cmq4cnp1k001ma3yq1rtme8si	cmq118uq30001cuonmbe5ypw9	Chocolate Brownie	200	20	serving	Desserts
cmq4cnp1o001oa3yqz4y5zk2o	cmq118uq30001cuonmbe5ypw9	Cheesecake	200	20	serving	Desserts
cmq4cnp1v001qa3yq1cyc0co6	cmq118uq30001cuonmbe5ypw9	Ice Cream	150	20	serving	Desserts
cmq4cnp21001sa3yq2fjxm44n	cmq118uq30001cuonmbe5ypw9	Soft Drinks	300	50	bottle	Soft Drinks
cmq4cnp25001ua3yqzmzcvc87	cmq118uq30001cuonmbe5ypw9	Fruit Juice	200	30	bottle	Soft Drinks
cmq4cnp2c001wa3yq9dlx2lwv	cmq118uq30001cuonmbe5ypw9	Still Water	300	50	bottle	Water
cmq4cnp2i001ya3yqr4nqi2px	cmq118uq30001cuonmbe5ypw9	Sparkling Water	200	30	bottle	Water
cmq4cnp2n0020a3yq0xpd50lx	cmq118uq60002cuonb0b9udoy	Ribeye Steak	500	50	serving	Main Meals
cmq4cnp2u0022a3yqeyied3kz	cmq118uq60002cuonb0b9udoy	Sirloin Steak	500	50	serving	Main Meals
cmq4cnp2z0024a3yqha9rksav	cmq118uq60002cuonb0b9udoy	Beef Fillet	500	50	serving	Main Meals
cmq4cnp340026a3yq2bljgij5	cmq118uq60002cuonb0b9udoy	Chicken Breast	500	50	serving	Main Meals
cmq4cnp3a0028a3yq9719c6yd	cmq118uq60002cuonb0b9udoy	Burger Patties	500	50	serving	Main Meals
cmq4cnp3f002aa3yqt38zmayc	cmq118uq60002cuonb0b9udoy	Chips	500	100	serving	Side Dishes
cmq4cnp3p002ea3yqj7832y33	cmq118uq60002cuonb0b9udoy	Salad Mix	200	30	serving	Side Dishes
cmq4cnp3v002ga3yqjutakgh0	cmq118uq60002cuonb0b9udoy	Onion Rings	300	30	serving	Side Dishes
cmq4cnp41002ia3yqwe6o3o1w	cmq118uq60002cuonb0b9udoy	Chocolate Brownie	200	20	serving	Desserts
cmq4cnp49002ka3yql0m0ru98	cmq118uq60002cuonb0b9udoy	Cheesecake	200	20	serving	Desserts
cmq4cnp4g002ma3yqebzpq6xd	cmq118uq60002cuonb0b9udoy	Ice Cream	150	20	serving	Desserts
cmq4cnp4m002oa3yq9x67ismm	cmq118uq60002cuonb0b9udoy	Soft Drinks	300	50	bottle	Soft Drinks
cmq4cnp4s002qa3yqokpcfa2j	cmq118uq60002cuonb0b9udoy	Fruit Juice	200	30	bottle	Soft Drinks
cmq4cnp4y002sa3yqrnxypzuz	cmq118uq60002cuonb0b9udoy	Still Water	300	50	bottle	Water
cmq4cnp53002ua3yqqs36qveo	cmq118uq60002cuonb0b9udoy	Sparkling Water	200	30	bottle	Water
cmq4cnp58002wa3yq6evztlrk	cmq118uq90003cuonl9nim67p	Ribeye Steak	500	50	serving	Main Meals
cmq4cnp5c002ya3yqtd3ms05e	cmq118uq90003cuonl9nim67p	Sirloin Steak	500	50	serving	Main Meals
cmq4cnp5f0030a3yqbtrd3cft	cmq118uq90003cuonl9nim67p	Beef Fillet	500	50	serving	Main Meals
cmq4cnp5l0032a3yq64j4vq7g	cmq118uq90003cuonl9nim67p	Chicken Breast	500	50	serving	Main Meals
cmq4cnp5t0034a3yqhdjrz7gt	cmq118uq90003cuonl9nim67p	Burger Patties	500	50	serving	Main Meals
cmq4cnp5z0036a3yq7edwhwja	cmq118uq90003cuonl9nim67p	Chips	500	100	serving	Side Dishes
cmq4cnp6w003ga3yqs5rj874h	cmq118uq90003cuonl9nim67p	Cheesecake	200	20	serving	Desserts
cmq4cnp72003ia3yq8tmpogwx	cmq118uq90003cuonl9nim67p	Ice Cream	150	20	serving	Desserts
cmq4cnp77003ka3yq7ucsnj9j	cmq118uq90003cuonl9nim67p	Soft Drinks	300	50	bottle	Soft Drinks
cmq4cnp7b003ma3yqzqw5myyh	cmq118uq90003cuonl9nim67p	Fruit Juice	200	30	bottle	Soft Drinks
cmq4cnp7h003oa3yqzccw7do2	cmq118uq90003cuonl9nim67p	Still Water	300	50	bottle	Water
cmq4cnp7m003qa3yqbtwq8qjv	cmq118uq90003cuonl9nim67p	Sparkling Water	200	30	bottle	Water
cmq4cnp7q003sa3yq6o43obnl	cmq118uqc0004cuonac33ndz8	Ribeye Steak	500	50	serving	Main Meals
cmq4cnp7x003ua3yqog09v052	cmq118uqc0004cuonac33ndz8	Sirloin Steak	500	50	serving	Main Meals
cmq4cnp81003wa3yqwo3cj53r	cmq118uqc0004cuonac33ndz8	Beef Fillet	500	50	serving	Main Meals
cmq4cnp86003ya3yqzwtfcetf	cmq118uqc0004cuonac33ndz8	Chicken Breast	500	50	serving	Main Meals
cmq4cnp8c0040a3yq8q5gtvwz	cmq118uqc0004cuonac33ndz8	Burger Patties	500	50	serving	Main Meals
cmq4cnp8h0042a3yqoxziks5g	cmq118uqc0004cuonac33ndz8	Chips	500	100	serving	Side Dishes
cmq4cnp8q0046a3yqhn0qjwxp	cmq118uqc0004cuonac33ndz8	Salad Mix	200	30	serving	Side Dishes
cmq4cnp8w0048a3yqpqpncbq9	cmq118uqc0004cuonac33ndz8	Onion Rings	300	30	serving	Side Dishes
cmq4cnp90004aa3yq9jtn87u8	cmq118uqc0004cuonac33ndz8	Chocolate Brownie	200	20	serving	Desserts
cmq4cnp95004ca3yqf7xn1wiy	cmq118uqc0004cuonac33ndz8	Cheesecake	200	20	serving	Desserts
cmq4cnp9a004ea3yqzrc7gry6	cmq118uqc0004cuonac33ndz8	Ice Cream	150	20	serving	Desserts
cmq4cnp9f004ga3yq6g3nhf6x	cmq118uqc0004cuonac33ndz8	Soft Drinks	300	50	bottle	Soft Drinks
cmq4cnp9j004ia3yqtqtydo5t	cmq118uqc0004cuonac33ndz8	Fruit Juice	200	30	bottle	Soft Drinks
cmq4cnp9o004ka3yqpjkczo0y	cmq118uqc0004cuonac33ndz8	Still Water	300	50	bottle	Water
cmq4cnp9t004ma3yqzld8ymxv	cmq118uqc0004cuonac33ndz8	Sparkling Water	200	30	bottle	Water
\.


--
-- Data for Name: InventoryTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InventoryTransaction" (id, "inventoryId", quantity, "transactionType", notes, "createdAt") FROM stdin;
cmq118uxl0049cuon788yrzdz	cmq118uxl0048cuonzc16vs86	50	IN	Initial seed stock	2026-06-05 14:41:49.977
cmq118uxw004ccuon11qaedxw	cmq118uxw004bcuonsdfvbnxd	40	IN	Initial seed stock	2026-06-05 14:41:49.988
cmq118uy3004fcuon3c21m0ht	cmq118uy3004ecuonloblkmj3	30	IN	Initial seed stock	2026-06-05 14:41:49.995
cmq118uya004icuonh9o4wi0h	cmq118uya004hcuonll5vpivh	20	IN	Initial seed stock	2026-06-05 14:41:50.003
cmq118uyh004lcuon13ej3bfr	cmq118uyh004kcuonvb5xskst	15	IN	Initial seed stock	2026-06-05 14:41:50.01
cmq118uyo004ocuons83svf14	cmq118uyo004ncuon30ogeyd0	100	IN	Initial seed stock	2026-06-05 14:41:50.016
cmq118uyv004rcuonc92uuq3z	cmq118uyu004qcuon5xql61lw	50	IN	Initial seed stock	2026-06-05 14:41:50.023
cmq118uz2004ucuonpnvk5h78	cmq118uz2004tcuon4928xuvw	40	IN	Initial seed stock	2026-06-05 14:41:50.03
cmq118uz8004xcuonxhoryomq	cmq118uz8004wcuonstlsf0bx	30	IN	Initial seed stock	2026-06-05 14:41:50.037
cmq118uzf0050cuoncrdx0qqs	cmq118uzf004zcuonbmtlpzih	20	IN	Initial seed stock	2026-06-05 14:41:50.043
cmq118uzm0053cuons39u1y15	cmq118uzm0052cuonrb96oxch	15	IN	Initial seed stock	2026-06-05 14:41:50.05
cmq118uzs0056cuon9kfy0kcv	cmq118uzs0055cuon2ixm11cy	100	IN	Initial seed stock	2026-06-05 14:41:50.056
cmq118uzy0059cuon7ktgmbis	cmq118uzy0058cuon7kydcs5n	50	IN	Initial seed stock	2026-06-05 14:41:50.063
cmq118v05005ccuonm0i6xpbi	cmq118v05005bcuoni0lx5kwn	40	IN	Initial seed stock	2026-06-05 14:41:50.069
cmq118v0b005fcuonz79vyl8u	cmq118v0b005ecuonp001bt9l	30	IN	Initial seed stock	2026-06-05 14:41:50.075
cmq118v0h005icuon2lcvcoir	cmq118v0h005hcuon7e8ycali	20	IN	Initial seed stock	2026-06-05 14:41:50.081
cmq118v0n005lcuon1estzm71	cmq118v0n005kcuonkgbdvpsy	15	IN	Initial seed stock	2026-06-05 14:41:50.087
cmq118v0t005ocuonbe02lfn6	cmq118v0t005ncuonopzorv0m	100	IN	Initial seed stock	2026-06-05 14:41:50.093
cmq118v13005rcuonupzgb1vw	cmq118v13005qcuontuav9rjp	50	IN	Initial seed stock	2026-06-05 14:41:50.104
cmq118v1c005ucuono9nz5c1h	cmq118v1c005tcuonrkmogtxf	40	IN	Initial seed stock	2026-06-05 14:41:50.112
cmq118v1l005xcuongu2v7n3i	cmq118v1l005wcuon3lrem8r9	30	IN	Initial seed stock	2026-06-05 14:41:50.121
cmq118v1u0060cuonchdgnoup	cmq118v1u005zcuonfgs7n7s1	20	IN	Initial seed stock	2026-06-05 14:41:50.131
cmq118v210063cuonalqu68bx	cmq118v210062cuonnym69c4z	15	IN	Initial seed stock	2026-06-05 14:41:50.138
cmq118v270066cuonoh5f94ao	cmq118v270065cuono4dy5zdi	100	IN	Initial seed stock	2026-06-05 14:41:50.144
cmq118v2i0069cuon8dflny21	cmq118v2i0068cuono1d8ok9b	50	IN	Initial seed stock	2026-06-05 14:41:50.154
cmq118v2o006ccuonyvxslrge	cmq118v2o006bcuonyw9qjf42	40	IN	Initial seed stock	2026-06-05 14:41:50.161
cmq118v2z006fcuon5fvlydhl	cmq118v2z006ecuonnklbnc55	30	IN	Initial seed stock	2026-06-05 14:41:50.171
cmq118v37006icuonjxu1ji64	cmq118v36006hcuonaptcn1nu	20	IN	Initial seed stock	2026-06-05 14:41:50.179
cmq118v3g006lcuonl3esuur0	cmq118v3g006kcuonuezd4nfg	15	IN	Initial seed stock	2026-06-05 14:41:50.188
cmq118v3n006ocuongebcyxp9	cmq118v3n006ncuonyqud1bm2	100	IN	Initial seed stock	2026-06-05 14:41:50.194
cmq323sra007z12pa11okbseq	cmq323sra007y12pacpqi1zb8	500	IN	Initial seed stock	2026-06-07 00:41:25.846
cmq323srj008212pagcjtmpd5	cmq323srj008112paxehmmjzh	500	IN	Initial seed stock	2026-06-07 00:41:25.855
cmq323srr008512paa9skignp	cmq323srr008412par3ll7hhc	500	IN	Initial seed stock	2026-06-07 00:41:25.864
cmq323srx008812pam558l3cm	cmq323srx008712pa0kn3rap4	500	IN	Initial seed stock	2026-06-07 00:41:25.87
cmq323ss6008b12paolsbm85r	cmq323ss6008a12pag20ovqc5	200	IN	Initial seed stock	2026-06-07 00:41:25.878
cmq323ssi008e12pa5tn7u6mv	cmq323ssi008d12pa25jykmit	500	IN	Initial seed stock	2026-06-07 00:41:25.89
cmq323ssp008h12pauxkwpvgh	cmq323ssp008g12pa731f4ptc	500	IN	Initial seed stock	2026-06-07 00:41:25.898
cmq323ssv008k12pa4ez33tng	cmq323ssv008j12pazn7fmia8	500	IN	Initial seed stock	2026-06-07 00:41:25.903
cmq323st0008n12paeqf70r4f	cmq323st0008m12paguxdfkqp	500	IN	Initial seed stock	2026-06-07 00:41:25.908
cmq323st7008q12pa1igibhv5	cmq323st7008p12pa77kryutd	200	IN	Initial seed stock	2026-06-07 00:41:25.915
cmq323ste008t12pa5h87hi5a	cmq323ste008s12pa8lei8nj4	500	IN	Initial seed stock	2026-06-07 00:41:25.922
cmq323stl008w12paf5z9q9vc	cmq323stl008v12paog3xfarq	500	IN	Initial seed stock	2026-06-07 00:41:25.93
cmq323stu008z12pa0n2otvjv	cmq323stu008y12pawvcb5320	500	IN	Initial seed stock	2026-06-07 00:41:25.938
cmq323su1009212pav3thphfz	cmq323su1009112pas8vdlyae	500	IN	Initial seed stock	2026-06-07 00:41:25.945
cmq323su6009512pak0i4lyll	cmq323su6009412paq5hv1thm	200	IN	Initial seed stock	2026-06-07 00:41:25.95
cmq323suf009812pa9chju138	cmq323suf009712pab5hkle7u	500	IN	Initial seed stock	2026-06-07 00:41:25.96
cmq323sul009b12pajbsezp9q	cmq323sul009a12pas659ib2n	500	IN	Initial seed stock	2026-06-07 00:41:25.966
cmq323sus009e12pajtuj7uao	cmq323sus009d12pazhpw9bbd	500	IN	Initial seed stock	2026-06-07 00:41:25.973
cmq323sv0009h12pa8xvcx1gp	cmq323suz009g12pag8wsdpst	500	IN	Initial seed stock	2026-06-07 00:41:25.98
cmq323sv7009k12paj4k0p9dt	cmq323sv7009j12patzwbedve	200	IN	Initial seed stock	2026-06-07 00:41:25.987
cmq323svh009n12pa0csm0p8d	cmq323svh009m12pahfktz9uj	500	IN	Initial seed stock	2026-06-07 00:41:25.997
cmq323svm009q12paxys53d5k	cmq323svm009p12pa7d4p0v53	500	IN	Initial seed stock	2026-06-07 00:41:26.002
cmq323svu009t12pavsm8veum	cmq323svu009s12pat4yp2q2a	500	IN	Initial seed stock	2026-06-07 00:41:26.011
cmq323sw0009w12paufgorn4o	cmq323sw0009v12pau5t8277z	500	IN	Initial seed stock	2026-06-07 00:41:26.016
cmq323sw5009z12papkjhmn5e	cmq323sw5009y12par36q78mv	200	IN	Initial seed stock	2026-06-07 00:41:26.021
cmq3l0grj0007iuex0s66cfhn	cmq118uz8004wcuonstlsf0bx	10	IN	Manual restock	2026-06-07 09:30:43.039
cmq3mgh17000a2ib1durm4735	cmq118uz8004wcuonstlsf0bx	10	IN	Manual restock	2026-06-07 10:11:09.499
cmq3mh067000c2ib1mcilzluj	cmq118uz8004wcuonstlsf0bx	10	IN	Manual restock	2026-06-07 10:11:34.304
cmq3nvu0j000r7dw1lkrsg15y	cmq118uy3004ecuonloblkmj3	10	IN	Manual restock	2026-06-07 10:51:05.78
cmq46s6970019kwoz3z337m5v	cmq323srx008712pa0kn3rap4	9	IN	Manual restock	2026-06-07 19:40:07.723
cmq47vs9a000512zs6twjcum4	cmq118uy3004ecuonloblkmj3	10	IN	Manual restock	2026-06-07 20:10:55.823
cmq7qzt0a003mz1m1r19cd9vp	cmq118uxw004bcuonsdfvbnxd	10	IN	Manual restock	2026-06-10 07:29:14.65
\.


--
-- Data for Name: MenuCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MenuCategory" (id, name) FROM stdin;
cmq118uqk0005cuon9ukmjjrn	Starters
cmq118uqr0006cuonl5w69ns7	Steaks
cmq118uqv0007cuonwxvh00tp	Burgers
cmq118uqz0008cuon4j2csef4	Sides
cmq118ur20009cuonj3i8ci2d	Desserts
cmq118ur6000acuong8jrwyx6	Drinks
\.


--
-- Data for Name: MenuItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MenuItem" (id, "categoryId", name, description, price, "imageUrl", "isAvailable") FROM stdin;
cmq118urc000ccuon8w5vta72	cmq118uqk0005cuon9ukmjjrn	Garlic Bread	Toasted sourdough with garlic butter	4.99	https://images.unsplash.com/photo-1619535860434-cf9b902578ac?w=400	t
cmq118urk000ecuondvbvzr74	cmq118uqk0005cuon9ukmjjrn	Prawn Cocktail	Classic prawn cocktail with Marie Rose sauce	7.99	https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400	t
cmq118urq000gcuon91rm9f5a	cmq118uqk0005cuon9ukmjjrn	Soup of the Day	Freshly made seasonal soup	5.49	https://images.unsplash.com/photo-1547592180-85f173990554?w=400	t
cmq118uru000icuong6395ewb	cmq118uqr0006cuonl5w69ns7	Ribeye 8oz	Prime ribeye, chargrilled to perfection	28.99	https://images.unsplash.com/photo-1558030006-450675393462?w=400	t
cmq118ury000kcuonlt36g9j9	cmq118uqr0006cuonl5w69ns7	Sirloin 10oz	Classic sirloin, seasoned and grilled	31.99	https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400	t
cmq118us3000mcuong5focegw	cmq118uqr0006cuonl5w69ns7	Fillet 8oz	Tender beef fillet, the finest cut	38.99	https://images.unsplash.com/photo-1607116667981-ff148b2d5b7b?w=400	t
cmq118us8000ocuonx8pv4gmr	cmq118uqr0006cuonl5w69ns7	T-Bone 16oz	The showstopper – for real steak lovers	44.99	https://images.unsplash.com/photo-1544025162-d76694265947?w=400	t
cmq118usc000qcuon3ygq4zqc	cmq118uqv0007cuonwxvh00tp	Steakz Classic Burger	6oz beef patty, lettuce, tomato, pickles	13.99	https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400	t
cmq118usg000scuon3bzw3dn7	cmq118uqv0007cuonwxvh00tp	BBQ Bacon Burger	Smoky BBQ, streaky bacon, cheddar	15.99	https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400	t
cmq118usk000ucuon1mx3cq3l	cmq118uqv0007cuonwxvh00tp	Mushroom Swiss Burger	Sautéed mushrooms, Swiss cheese	14.99	https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400	t
cmq118usp000wcuonxfc0ghjb	cmq118uqz0008cuon4j2csef4	Chunky Chips	Thick-cut hand-fried chips	3.99	https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400	t
cmq118ust000ycuontytdsic1	cmq118uqz0008cuon4j2csef4	Onion Rings	Crispy battered onion rings	3.49	https://images.unsplash.com/photo-1639024471283-03518883512d?w=400	t
cmq118usx0010cuondz9gy0rj	cmq118uqz0008cuon4j2csef4	Side Salad	Mixed leaves with house dressing	3.49	https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400	t
cmq118ut10012cuonptg7yydo	cmq118uqz0008cuon4j2csef4	Peppercorn Sauce	Classic creamy peppercorn	2.49	https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400	t
cmq118ut50014cuoncm8fcrhy	cmq118ur20009cuonj3i8ci2d	Chocolate Brownie	Warm brownie with vanilla ice cream	6.99	https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400	t
cmq118uta0016cuoney9xi8h6	cmq118ur20009cuonj3i8ci2d	Cheesecake	New York-style baked cheesecake	6.49	https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400	t
cmq118ute0018cuon1arh3npm	cmq118ur6000acuong8jrwyx6	Soft Drink	Coke, Diet Coke, Lemonade, J2O	2.99	https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400	t
cmq118uti001acuonkbakqhn4	cmq118ur6000acuong8jrwyx6	Sparkling Water	330ml bottle	1.99	https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?w=400	t
cmq118utm001ccuone5vqyeh5	cmq118ur6000acuong8jrwyx6	House Wine (Glass)	Red, White, or Rosé	5.49	https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400	t
cmq118utq001ecuon6v3qx9dx	cmq118ur6000acuong8jrwyx6	Beer (Pint)	Lager or Ale	4.99	https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400	t
cmq4cnowk0006a3yq3x4vu35r	cmq118ur6000acuong8jrwyx6	Still Water	500ml still mineral water	2.50	https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400	t
\.


--
-- Data for Name: NewsletterSubscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."NewsletterSubscription" (id, email, "createdAt", name) FROM stdin;
cmq3mb3la00002ib1xl6aetu2	thf@gmail.com	2026-06-07 10:06:58.798	thgs
cmq3siell000tgxgo4h0d8dlh	th@gmail.com	2026-06-07 13:00:37.353	rgf
cmq52tuz00016k8ydhqbwkb5h	uideg@gmail.com	2026-06-08 10:37:14.124	vedy
cmq75lmld0006z1m17iznwtgp	testuser@example.com	2026-06-09 21:30:21.217	Test User
cmq79g63a001fz1m1fm0cagwa	testuser1@example.com	2026-06-09 23:18:05.014	Test User
cmq9cbb72000qfx7lw9009tl8	testuser2@example.com	2026-06-11 10:13:49.548	Test User
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "userId", type, title, message, "isRead", link, "createdAt") FROM stdin;
cmq3mjl9k000i2ib1buskczde	cmq118zjl006zcuongyo8moj0	ORDER_UPDATE	Order Ready to Serve	Order #XNG0MK is ready — Table 8	f	\N	2026-06-07 10:13:34.951
cmq3mjqu3000o2ib1x81u2muf	cmq118zjl006zcuongyo8moj0	ORDER_UPDATE	Order Ready to Serve	Order #S5AZ3H is ready — Table 9	f	\N	2026-06-07 10:13:42.171
cmq3mjt7w000u2ib1bk76jxbt	cmq118zjl006zcuongyo8moj0	ORDER_UPDATE	Order Ready to Serve	Order #PP3JWA is ready — Table 10	f	\N	2026-06-07 10:13:45.26
cmq3318rz000f3803f13u3sqz	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #2YLTF6 is ready at Manchester. Please collect or wait for your waiter.	t	\N	2026-06-07 01:07:26.255
cmq3l2wj6000biuex0mnbwd7s	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #5SIC9X is ready at Manchester. Please collect or wait for your waiter.	t	\N	2026-06-07 09:32:36.786
cmq3mjl9j000g2ib1bczpcewf	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #XNG0MK is ready at London Central. Please collect or wait for your waiter.	t	\N	2026-06-07 10:13:34.951
cmq3mjqu3000n2ib1ygc9yhe3	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #S5AZ3H is ready at London Central. Please collect or wait for your waiter.	t	\N	2026-06-07 10:13:42.171
cmq3mjt7v000t2ib1xy11iy16	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #PP3JWA is ready at London Central. Please collect or wait for your waiter.	t	\N	2026-06-07 10:13:45.26
cmq3nr8zk000k7dw13ul4elve	cmq119424007bcuon3ins03xg	RESERVATION_UPDATE	New Reservation	New reservation: 2 guests on 14/06/2026 at 13:30 — Table 1	f	\N	2026-06-07 10:47:31.904
cmq49j04b0005vmsjpsqb37bg	cmq118vvn006pcuonlwldds1o	RESERVATION_UPDATE	Reservation Confirmed	Your reservation at Manchester on 08/06/2026 for 4 has been confirmed (table 5).	t	\N	2026-06-07 20:56:58.715
cmq3nzffp000z7dw1uqvl60og	cmq11938c0079cuon1a2im4w6	ORDER_UPDATE	Order Ready to Serve	Order #XSY3DQ is ready — Table 10	f	\N	2026-06-07 10:53:53.509
cmq3nzffq00137dw12du2xp1l	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #XSY3DQ is ready at Manchester. Please collect or wait for your waiter.	t	\N	2026-06-07 10:53:53.509
cmq3sdhnl000ogxgon9f095ai	cmq119424007bcuon3ins03xg	RESERVATION_UPDATE	New Reservation	New reservation: 2 guests on 13/06/2026 at 13:30 — Table 1	f	\N	2026-06-07 12:56:48.034
cmq3nzffq00117dw13ttfcxyj	cmq1192k90077cuoni2akrh82	ORDER_UPDATE	Order Ready to Serve	Order #XSY3DQ is ready — Table 10	t	\N	2026-06-07 10:53:53.509
cmq3sdhi1000kgxgotfij13hk	cmq118vvn006pcuonlwldds1o	RESERVATION_UPDATE	Reservation Confirmed	Your reservation at Manchester on 13/06/2026 for 2 has been confirmed (table 1).	t	\N	2026-06-07 12:56:47.834
cmq42blro000h9eoau5ory16x	cmq119enf0085cuonj98ydajo	ORDER_UPDATE	New Order Received	New customer order #XBL6LF — 3 item(s) to prepare	f	\N	2026-06-07 17:35:16.212
cmq3mjl9k000k2ib162nsxhxg	cmq118ysb006xcuon40u695ve	ORDER_UPDATE	Order Ready to Serve	Order #XNG0MK is ready — Table 8	t	\N	2026-06-07 10:13:34.951
cmq3mjqxe000q2ib13v0d90sk	cmq118ysb006xcuon40u695ve	ORDER_UPDATE	Order Ready to Serve	Order #S5AZ3H is ready — Table 9	t	\N	2026-06-07 10:13:42.171
cmq3mjt7w000w2ib1v56tlpuk	cmq118ysb006xcuon40u695ve	ORDER_UPDATE	Order Ready to Serve	Order #PP3JWA is ready — Table 10	t	\N	2026-06-07 10:13:45.26
cmq484856000k12zs3uuyl0xc	cmq119424007bcuon3ins03xg	ORDER_UPDATE	New Order Received	New customer order #NWI1DL — 4 item(s) to prepare	f	\N	2026-06-07 20:17:29.659
cmq49j0lk0009vmsjj44fnujp	cmq119424007bcuon3ins03xg	RESERVATION_UPDATE	New Reservation	New reservation: 4 guests on 08/06/2026 at 20:00 — Table 5	f	\N	2026-06-07 20:56:59.336
cmq49jy59000jvmsjzovijfty	cmq119424007bcuon3ins03xg	ORDER_UPDATE	New Order Received	New customer order #FOPNNV — 2 item(s) to prepare	f	\N	2026-06-07 20:57:42.813
cmq3nr8zd000i7dw17r79kg3b	cmq1191tt0075cuonf80qee5m	RESERVATION_UPDATE	New Reservation	New reservation at Manchester — party of 2 on 14/06/2026 (table 1).	t	\N	2026-06-07 10:47:31.897
cmq3sdhm3000mgxgocqifejxq	cmq1191tt0075cuonf80qee5m	RESERVATION_UPDATE	New Reservation	New reservation at Manchester — party of 2 on 13/06/2026 (table 1).	t	\N	2026-06-07 12:56:47.979
cmq4848e0000m12zs8vn2ey4k	cmq1191tt0075cuonf80qee5m	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #NWI1DL — £89.96	t	\N	2026-06-07 20:17:29.614
cmq49j0le0007vmsjt8f2kk6v	cmq1191tt0075cuonf80qee5m	RESERVATION_UPDATE	New Reservation	New reservation at Manchester — party of 4 on 08/06/2026 (table 5).	t	\N	2026-06-07 20:56:59.329
cmq42blrb000f9eoaagm03gk2	cmq119clh007zcuonc7uo7m2e	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #XBL6LF — £41.97	t	\N	2026-06-07 17:35:16.195
cmq49jy2m000hvmsjqk8e77pd	cmq1191tt0075cuonf80qee5m	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #FOPNNV — £10.48	t	\N	2026-06-07 20:57:42.718
cmq49psvu000svmsjsqfrsfmt	cmq11938c0079cuon1a2im4w6	ORDER_UPDATE	Order Ready to Serve	Order #FOPNNV is ready — Table N/A	f	\N	2026-06-07 21:02:15.929
cmq49psvs000qvmsju1crhnqk	cmq1192k90077cuoni2akrh82	ORDER_UPDATE	Order Ready to Serve	Order #FOPNNV is ready — Table N/A	t	\N	2026-06-07 21:02:15.928
cmq4cwi5g00082y1s1bwcbz65	cmq119424007bcuon3ins03xg	ORDER_UPDATE	New Order Received	New customer order #718M08 — 2 item(s) to prepare	f	\N	2026-06-07 22:31:27.461
cmq4cxmsg000j2y1s9j1n3ko6	cmq119424007bcuon3ins03xg	RESERVATION_UPDATE	New Reservation	New reservation: 4 guests on 08/06/2026 at 12:30 — Table 6	f	\N	2026-06-07 22:32:20.128
cmq4d0l5d000t2y1suuck6d45	cmq11938c0079cuon1a2im4w6	ORDER_UPDATE	Order Ready to Serve	Order #718M08 is ready — Table N/A	f	\N	2026-06-07 22:34:37.967
cmq4d0l59000p2y1s7gajiaom	cmq1192k90077cuoni2akrh82	ORDER_UPDATE	Order Ready to Serve	Order #718M08 is ready — Table N/A	t	\N	2026-06-07 22:34:37.966
cmq4etq5f000b3vhiss6x6egx	cmq119424007bcuon3ins03xg	RESERVATION_UPDATE	New Reservation	New reservation: 6 guests on 08/06/2026 at 20:00 — Table 9	f	\N	2026-06-07 23:25:17.092
cmq4eulrs000k3vhifqmkiypf	cmq119424007bcuon3ins03xg	ORDER_UPDATE	New Order Received	New customer order #QKYO4B — 2 item(s) to prepare	f	\N	2026-06-07 23:25:58.072
cmq4ex21l000t3vhigm0idk2y	cmq11938c0079cuon1a2im4w6	ORDER_UPDATE	Order Ready to Serve	Order #QKYO4B is ready — Table N/A	f	\N	2026-06-07 23:27:52.472
cmq4ex21j000q3vhi4gv82bau	cmq1192k90077cuoni2akrh82	ORDER_UPDATE	Order Ready to Serve	Order #QKYO4B is ready — Table N/A	t	\N	2026-06-07 23:27:52.472
cmq4zvvz6000fyb4yw7u4jpm1	cmq1190do0071cuonhxlmvbeo	ORDER_UPDATE	New Order Received	New order #VKQ9EG — 1 item(s) to prepare (table 1)	f	\N	2026-06-08 09:14:49.89
cmq4zwcvk000jyb4ykt73g241	cmq118zjl006zcuongyo8moj0	ORDER_UPDATE	Order Ready to Serve	Order #VKQ9EG is ready — Table 1	f	\N	2026-06-08 09:15:11.792
cmq49psvw000uvmsjil548ozg	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #FOPNNV is ready at Manchester. Please collect or wait for your waiter.	t	\N	2026-06-07 21:02:15.932
cmq4cxmrm000e2y1swo2k7vfd	cmq118vvn006pcuonlwldds1o	RESERVATION_UPDATE	Reservation Confirmed	Your reservation at Manchester on 08/06/2026 for 4 has been confirmed (table 6).	t	\N	2026-06-07 22:32:20.098
cmq4d0l5c000r2y1sn20lw73i	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #718M08 is ready at Manchester. Please collect or wait for your waiter.	t	\N	2026-06-07 22:34:37.967
cmq4etq5400063vhilfo9vjyt	cmq118vvn006pcuonlwldds1o	RESERVATION_UPDATE	Reservation Confirmed	Your reservation at Manchester on 08/06/2026 for 6 has been confirmed (table 9).	t	\N	2026-06-07 23:25:17.081
cmq4ex21m000u3vhir42x03j0	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #QKYO4B is ready at Manchester. Please collect or wait for your waiter.	t	\N	2026-06-07 23:27:52.472
cmq504q3s001dyb4y2lqw6fs0	cmq119424007bcuon3ins03xg	ORDER_UPDATE	New Order Received	New customer order #RPI3HS — 1 item(s) to prepare	f	\N	2026-06-08 09:21:42.184
cmq50y1dw0007kjudse5xuagc	cmq119424007bcuon3ins03xg	ORDER_UPDATE	New Order Received	New customer order #KT09KQ — 1 item(s) to prepare	f	\N	2026-06-08 09:44:29.829
cmq4cwi8g000a2y1sn6qyozyv	cmq1191tt0075cuonf80qee5m	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #718M08 — £60.98	t	\N	2026-06-07 22:31:27.456
cmq4cxmsa000g2y1sbcbks4ne	cmq1191tt0075cuonf80qee5m	RESERVATION_UPDATE	New Reservation	New reservation at Manchester — party of 4 on 08/06/2026 (table 6).	t	\N	2026-06-07 22:32:20.122
cmq4etq5a00083vhibcilpl3u	cmq1191tt0075cuonf80qee5m	RESERVATION_UPDATE	New Reservation	New reservation at Manchester — party of 6 on 08/06/2026 (table 9).	t	\N	2026-06-07 23:25:17.086
cmq4eulrl000i3vhid6bw8fsp	cmq1191tt0075cuonf80qee5m	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #QKYO4B — £70.98	t	\N	2026-06-07 23:25:58.065
cmq504pqa001byb4y78yapd6o	cmq1191tt0075cuonf80qee5m	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #RPI3HS — £28.99	t	\N	2026-06-08 09:21:41.699
cmq50y1o20009kjudgzc4bwt3	cmq1191tt0075cuonf80qee5m	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #KT09KQ — £28.99	t	\N	2026-06-08 09:44:29.74
cmq510j7q000jkjud61yznu6t	cmq11938c0079cuon1a2im4w6	ORDER_UPDATE	Order Ready to Serve	Order #RPI3HS is ready — Table N/A	f	\N	2026-06-08 09:46:26.244
cmq5110k2000pkjud6wfspm28	cmq11938c0079cuon1a2im4w6	ORDER_UPDATE	Order Ready to Serve	Order #NWI1DL is ready — Table N/A	f	\N	2026-06-08 09:46:48.72
cmq510j7o000hkjudro0791z8	cmq1192k90077cuoni2akrh82	ORDER_UPDATE	Order Ready to Serve	Order #RPI3HS is ready — Table N/A	t	\N	2026-06-08 09:46:26.244
cmq5110k0000nkjud8w0z0tf0	cmq1192k90077cuoni2akrh82	ORDER_UPDATE	Order Ready to Serve	Order #NWI1DL is ready — Table N/A	t	\N	2026-06-08 09:46:48.72
cmq511aea000ukjudtpjjfg2c	cmq1192k90077cuoni2akrh82	ORDER_UPDATE	Order Ready to Serve	Order #KT09KQ is ready — Table N/A	t	\N	2026-06-08 09:47:01.475
cmq51450t0017kjudol604q0i	cmq1191tt0075cuonf80qee5m	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #FXHEYZ — £28.99	f	\N	2026-06-08 09:49:14.475
cmq5145150019kjud2z04xg9y	cmq119424007bcuon3ins03xg	ORDER_UPDATE	New Order Received	New customer order #FXHEYZ — 1 item(s) to prepare	f	\N	2026-06-08 09:49:14.489
cmq510j7y000lkjud7z3rez3u	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #RPI3HS is ready at Manchester. Please collect or wait for your waiter.	t	\N	2026-06-08 09:46:26.254
cmq4zwczf000lyb4yun2kb52e	cmq118ysb006xcuon40u695ve	ORDER_UPDATE	Order Ready to Serve	Order #VKQ9EG is ready — Table 1	t	\N	2026-06-08 09:15:11.792
cmq5110k2000rkjud15zputx2	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #NWI1DL is ready at Manchester. Please collect or wait for your waiter.	t	\N	2026-06-08 09:46:48.721
cmq511aeb000vkjudk06tqbv3	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #KT09KQ is ready at Manchester. Please collect or wait for your waiter.	t	\N	2026-06-08 09:47:01.475
cmq511ael000xkjudf5q9qyk4	cmq11938c0079cuon1a2im4w6	ORDER_UPDATE	Order Ready to Serve	Order #KT09KQ is ready — Table N/A	f	\N	2026-06-08 09:47:01.475
cmq51nn1d0003l5xeo3oureti	cmq11938c0079cuon1a2im4w6	ORDER_UPDATE	Order Ready to Serve	Order #FXHEYZ is ready — Table N/A	f	\N	2026-06-08 10:04:24.289
cmq51nn1c0001l5xexyj5lqbo	cmq1192k90077cuoni2akrh82	ORDER_UPDATE	Order Ready to Serve	Order #FXHEYZ is ready — Table N/A	t	\N	2026-06-08 10:04:24.288
cmq526vki0007k8ydtnpp0y4b	cmq118y1o006vcuonry5z7sgx	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #M8QO6K — £31.99	f	\N	2026-06-08 10:19:21.809
cmq526vto0009k8ydbh7v6ub6	cmq1190do0071cuonhxlmvbeo	ORDER_UPDATE	New Order Received	New customer order #M8QO6K — 1 item(s) to prepare	f	\N	2026-06-08 10:19:22.139
cmq528pc1000gk8yd4mhbyz91	cmq118zjl006zcuongyo8moj0	ORDER_UPDATE	Order Ready to Serve	Order #M8QO6K is ready — Table N/A	f	\N	2026-06-08 10:20:47.04
cmq52q0yd000tk8ydm5mopnxh	cmq119enf0085cuonj98ydajo	ORDER_UPDATE	New Order Received	New customer order #35SHLA — 1 item(s) to prepare	f	\N	2026-06-08 10:34:15.247
cmq51nnyu0005l5xek57bg287	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #FXHEYZ is ready at Manchester. Please collect or wait for your waiter.	t	\N	2026-06-08 10:04:24.289
cmq528pet000jk8ydcy9r5ead	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #M8QO6K is ready at London. Please collect or wait for your waiter.	t	\N	2026-06-08 10:20:47.141
cmq52rnsm0011k8ydq8u0j2py	cmq119d9j0081cuon2flvofg7	ORDER_UPDATE	Order Ready to Serve	Order #35SHLA is ready — Table N/A	f	\N	2026-06-08 10:35:31.393
cmq52rnpe000zk8ydrhy4rhcu	cmq119dy40083cuonv2b7gjnw	ORDER_UPDATE	Order Ready to Serve	Order #35SHLA is ready — Table N/A	f	\N	2026-06-08 10:35:31.394
cmq52q0dr000rk8ydkbdolg14	cmq119clh007zcuonc7uo7m2e	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #35SHLA — £28.99	t	\N	2026-06-08 10:34:14.512
cmq52rnsn0013k8yd58jbc0np	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #35SHLA is ready at Liverpool. Please collect or wait for your waiter.	t	\N	2026-06-08 10:35:31.394
cmq7aaq2z0020z1m1mgh4r6u1	cmq118vvn006pcuonlwldds1o	RESERVATION_UPDATE	Reservation Confirmed	Your reservation at London on 11/06/2026 for 6 has been confirmed (table 9).	f	\N	2026-06-09 23:41:50.604
cmq7aaq360022z1m1nid6phsz	cmq118y1o006vcuonry5z7sgx	RESERVATION_UPDATE	New Reservation	New reservation at London — party of 6 on 11/06/2026 (table 9).	f	\N	2026-06-09 23:41:50.61
cmq7aaq3a0025z1m1tr6t6rd6	cmq1190do0071cuonhxlmvbeo	RESERVATION_UPDATE	New Reservation	New reservation: 6 guests on 11/06/2026 at 20:00 — Table 9	f	\N	2026-06-09 23:41:50.614
cmq7ae0l2002gz1m1m9oivzhh	cmq118y1o006vcuonry5z7sgx	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #JTPH7Q — £60.98	f	\N	2026-06-09 23:44:24.182
cmq7ae0l9002iz1m11g2wl1xi	cmq1190do0071cuonhxlmvbeo	ORDER_UPDATE	New Order Received	New customer order #JTPH7Q — 2 item(s) to prepare	f	\N	2026-06-09 23:44:24.189
cmq7afdsw002oz1m12hnuniog	cmq118zjl006zcuongyo8moj0	ORDER_UPDATE	Order Ready to Serve	Order #JTPH7Q is ready — Table N/A	f	\N	2026-06-09 23:45:27.967
cmq7afdsw002qz1m17013mvs4	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #JTPH7Q is ready at London. Please collect or wait for your waiter.	f	\N	2026-06-09 23:45:27.967
cmq7qu7860034z1m16rr9kiv0	cmq1190do0071cuonhxlmvbeo	ORDER_UPDATE	New Order Received	New customer order #RSIO8T — 1 item(s) to prepare	f	\N	2026-06-10 07:24:53.142
cmq7qu7gy0036z1m1urv1p1nv	cmq118y1o006vcuonry5z7sgx	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #RSIO8T — £28.99	f	\N	2026-06-10 07:24:53.114
cmq7qvr32003ez1m1zgn8ikvk	cmq118zjl006zcuongyo8moj0	ORDER_UPDATE	Order Ready to Serve	Order #RSIO8T is ready — Table N/A	f	\N	2026-06-10 07:26:05.533
cmq7qvr3a003gz1m1s0tl3rw7	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #RSIO8T is ready at London. Please collect or wait for your waiter.	f	\N	2026-06-10 07:26:05.534
cmq826tmj0009hajqo442375y	cmq118y1o006vcuonry5z7sgx	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #IETVX5 — £28.99	f	\N	2026-06-10 12:42:37.818
cmq826txo000bhajq2ahvlkpu	cmq1190do0071cuonhxlmvbeo	ORDER_UPDATE	New Order Received	New customer order #IETVX5 — 1 item(s) to prepare	f	\N	2026-06-10 12:42:38.22
cmq827cap000hhajqkps9fl8e	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #IETVX5 is ready at London. Please collect or wait for your waiter.	f	\N	2026-06-10 12:43:02.017
cmq827cie000jhajqxe3keybj	cmq118zjl006zcuongyo8moj0	ORDER_UPDATE	Order Ready to Serve	Order #IETVX5 is ready — Table N/A	f	\N	2026-06-10 12:43:01.987
cmq8isjyk000ffx7llrq4i7ca	cmq118y1o006vcuonry5z7sgx	ORDER_UPDATE	New Customer Order	New online order placed by customer. Order #ZQ4ENQ — £31.99	f	\N	2026-06-10 20:27:25.578
cmq8isjyp000hfx7ld36pdj99	cmq1190do0071cuonhxlmvbeo	ORDER_UPDATE	New Order Received	New customer order #ZQ4ENQ — 1 item(s) to prepare	f	\N	2026-06-10 20:27:25.585
cmq8itorl000lfx7lubqs74hc	cmq118zjl006zcuongyo8moj0	ORDER_UPDATE	Order Ready to Serve	Order #ZQ4ENQ is ready — Table N/A	f	\N	2026-06-10 20:28:18.466
cmq8itp6l000nfx7l6c8eutok	cmq118vvn006pcuonlwldds1o	ORDER_UPDATE	Your order is ready!	Order #ZQ4ENQ is ready at London. Please collect or wait for your waiter.	f	\N	2026-06-10 20:28:18.467
cmq528pci000hk8ydgppqlyrz	cmq118ysb006xcuon40u695ve	ORDER_UPDATE	Order Ready to Serve	Order #M8QO6K is ready — Table N/A	t	\N	2026-06-08 10:20:47.039
cmq7afdsu002mz1m18o9ypbuy	cmq118ysb006xcuon40u695ve	ORDER_UPDATE	Order Ready to Serve	Order #JTPH7Q is ready — Table N/A	t	\N	2026-06-09 23:45:27.967
cmq7qvr30003cz1m16jnt8k82	cmq118ysb006xcuon40u695ve	ORDER_UPDATE	Order Ready to Serve	Order #RSIO8T is ready — Table N/A	t	\N	2026-06-10 07:26:05.533
cmq827c9t000fhajqate6q7pj	cmq118ysb006xcuon40u695ve	ORDER_UPDATE	Order Ready to Serve	Order #IETVX5 is ready — Table N/A	t	\N	2026-06-10 12:43:01.986
cmq8itpdb000pfx7l7s43u9n4	cmq118ysb006xcuon40u695ve	ORDER_UPDATE	Order Ready to Serve	Order #ZQ4ENQ is ready — Table N/A	t	\N	2026-06-10 20:28:18.466
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, "branchId", "tableId", "waiterId", "basketId", status, total, "createdAt", "customerId") FROM stdin;
cmq324be900a112pa2p9m8dkj	cmq118upo0000cuonozp6ur0p	cmq118utx001gcuonyc893lw2	cmq118ysb006xcuon40u695ve	\N	COMPLETED	12.98	2026-05-28 00:41:49.998	cmq118vvn006pcuonlwldds1o
cmq324bex00a812pa3ina5ch0	cmq118upo0000cuonozp6ur0p	cmq118uu2001icuonnbwxx2ow	cmq118ysb006xcuon40u695ve	\N	COMPLETED	13.48	2026-05-29 00:41:50.023	cmq118vvn006pcuonlwldds1o
cmq324bf700af12pa2sva0cd9	cmq118upo0000cuonozp6ur0p	cmq118uu5001kcuon1x377p60	cmq118ysb006xcuon40u695ve	\N	COMPLETED	34.48	2026-05-30 00:41:50.034	cmq118vvn006pcuonlwldds1o
cmq324bfi00am12pau1mo6dgs	cmq118upo0000cuonozp6ur0p	cmq118uu8001mcuons5a56px5	cmq118ysb006xcuon40u695ve	\N	COMPLETED	12.98	2026-05-31 00:41:50.045	cmq118vvn006pcuonlwldds1o
cmq324bgm00b712pawkiegnfl	cmq118upo0000cuonozp6ur0p	cmq118uuf001scuonb4n7pw5c	cmq118ysb006xcuon40u695ve	\N	SERVED	12.98	2026-06-03 00:41:50.085	cmq118vvn006pcuonlwldds1o
cmq324bjx00cd12pajkcb4xos	cmq118uq30001cuonmbe5ypw9	cmq118uup0020cuonsq38ddrh	cmq1192k90077cuoni2akrh82	\N	COMPLETED	12.98	2026-05-28 00:41:50.204	cmq118vvn006pcuonlwldds1o
cmq324bk700ck12par95rpsy3	cmq118uq30001cuonmbe5ypw9	cmq118uur0022cuonclae6vzd	cmq1192k90077cuoni2akrh82	\N	COMPLETED	13.48	2026-05-29 00:41:50.214	cmq118vvn006pcuonlwldds1o
cmq324bkl00cr12paqg7q5ja3	cmq118uq30001cuonmbe5ypw9	cmq118uut0024cuon3mu8ld75	cmq1192k90077cuoni2akrh82	\N	COMPLETED	34.48	2026-05-30 00:41:50.228	cmq118vvn006pcuonlwldds1o
cmq324bkz00cy12pa6kalhrer	cmq118uq30001cuonmbe5ypw9	cmq118uuw0026cuonloxoz4x4	cmq1192k90077cuoni2akrh82	\N	COMPLETED	12.98	2026-05-31 00:41:50.242	cmq118vvn006pcuonlwldds1o
cmq324bod00ep12paipgv03l9	cmq118uq60002cuonb0b9udoy	cmq118uvd002kcuonjag5sea0	cmq11965n007hcuon020rnbvi	\N	COMPLETED	12.98	2026-05-28 00:41:50.364	cmq118vvn006pcuonlwldds1o
cmq324boo00ew12pao7ngu4l9	cmq118uq60002cuonb0b9udoy	cmq118uvf002mcuon4u5bvd5a	cmq11965n007hcuon020rnbvi	\N	COMPLETED	13.48	2026-05-29 00:41:50.374	cmq118vvn006pcuonlwldds1o
cmq324boz00f312palu845c0u	cmq118uq60002cuonb0b9udoy	cmq118uvi002ocuonxtq5mjxo	cmq11965n007hcuon020rnbvi	\N	COMPLETED	34.48	2026-05-30 00:41:50.385	cmq118vvn006pcuonlwldds1o
cmq324bpf00fa12paeapu1x43	cmq118uq60002cuonb0b9udoy	cmq118uvk002qcuonpz365b3q	cmq11965n007hcuon020rnbvi	\N	COMPLETED	12.98	2026-05-31 00:41:50.402	cmq118vvn006pcuonlwldds1o
cmq324bpo00fh12pa928npyl3	cmq118uq60002cuonb0b9udoy	cmq118uvm002scuondmlww2qw	cmq11965n007hcuon020rnbvi	\N	SERVED	13.48	2026-06-01 00:41:50.411	cmq118vvn006pcuonlwldds1o
cmq324bq500fo12pa45gx4nv0	cmq118uq60002cuonb0b9udoy	cmq118uvo002ucuona9lt4xfg	cmq11965n007hcuon020rnbvi	\N	SERVED	34.48	2026-06-02 00:41:50.428	cmq118vvn006pcuonlwldds1o
cmq324bqg00fv12paw5mw1r4h	cmq118uq60002cuonb0b9udoy	cmq118uvq002wcuon66ggbfjn	cmq11965n007hcuon020rnbvi	\N	SERVED	12.98	2026-06-03 00:41:50.438	cmq118vvn006pcuonlwldds1o
cmq324bqx00g212pak468p7p1	cmq118uq60002cuonb0b9udoy	cmq118uvs002ycuonxuaikgzl	cmq11965n007hcuon020rnbvi	\N	PENDING	13.48	2026-06-04 00:41:50.456	cmq118vvn006pcuonlwldds1o
cmq324brd00g712pamwi84ed6	cmq118uq60002cuonb0b9udoy	cmq118uvu0030cuonwma9sy7l	cmq11965n007hcuon020rnbvi	\N	PENDING	34.48	2026-06-05 00:41:50.472	cmq118vvn006pcuonlwldds1o
cmq324brt00gc12palnvi7sl3	cmq118uq60002cuonb0b9udoy	cmq118uvx0032cuon6ribef1f	cmq11965n007hcuon020rnbvi	\N	PENDING	12.98	2026-06-06 00:41:50.488	cmq118vvn006pcuonlwldds1o
cmq324btk00h112pahy0zh3vr	cmq118uq90003cuonl9nim67p	cmq118uw10034cuonviyhpt6s	cmq1199wb007rcuon23bw9ej6	\N	COMPLETED	12.98	2026-05-28 00:41:50.55	cmq118vvn006pcuonlwldds1o
cmq324bty00h812pa7i7l2x4h	cmq118uq90003cuonl9nim67p	cmq118uw40036cuonj2deynr3	cmq1199wb007rcuon23bw9ej6	\N	COMPLETED	13.48	2026-05-29 00:41:50.565	cmq118vvn006pcuonlwldds1o
cmq324bug00hf12pa3zo9593s	cmq118uq90003cuonl9nim67p	cmq118uw80038cuonf3q14t5u	cmq1199wb007rcuon23bw9ej6	\N	COMPLETED	34.48	2026-05-30 00:41:50.583	cmq118vvn006pcuonlwldds1o
cmq324bv200hm12pafbqyhv45	cmq118uq90003cuonl9nim67p	cmq118uwb003acuon790h0cg8	cmq1199wb007rcuon23bw9ej6	\N	COMPLETED	12.98	2026-05-31 00:41:50.605	cmq118vvn006pcuonlwldds1o
cmq324bvj00ht12patpwfs5pf	cmq118uq90003cuonl9nim67p	cmq118uwe003ccuonrow11ena	cmq1199wb007rcuon23bw9ej6	\N	SERVED	13.48	2026-06-01 00:41:50.622	cmq118vvn006pcuonlwldds1o
cmq324bvy00i012pa7e64rsk9	cmq118uq90003cuonl9nim67p	cmq118uwh003ecuon6izukitn	cmq1199wb007rcuon23bw9ej6	\N	SERVED	34.48	2026-06-02 00:41:50.637	cmq118vvn006pcuonlwldds1o
cmq324bwe00i712pa4i6yjoqx	cmq118uq90003cuonl9nim67p	cmq118uwj003gcuonjss25hot	cmq1199wb007rcuon23bw9ej6	\N	SERVED	12.98	2026-06-03 00:41:50.653	cmq118vvn006pcuonlwldds1o
cmq324bwv00ie12paa4rz61x4	cmq118uq90003cuonl9nim67p	cmq118uwl003icuonis56vcgw	cmq1199wb007rcuon23bw9ej6	\N	PENDING	13.48	2026-06-04 00:41:50.67	cmq118vvn006pcuonlwldds1o
cmq324bxd00ij12pa24pxf7y3	cmq118uq90003cuonl9nim67p	cmq118uwo003kcuone2g27swa	cmq1199wb007rcuon23bw9ej6	\N	PENDING	34.48	2026-06-05 00:41:50.686	cmq118vvn006pcuonlwldds1o
cmq324bxq00io12pagmljwtzk	cmq118uq90003cuonl9nim67p	cmq118uwr003mcuontirus93f	cmq1199wb007rcuon23bw9ej6	\N	PENDING	12.98	2026-06-06 00:41:50.701	cmq118vvn006pcuonlwldds1o
cmq324bzj00jd12pa8a7s1we5	cmq118uqc0004cuonac33ndz8	cmq118uww003ocuonojmwxud2	cmq119d9j0081cuon2flvofg7	\N	COMPLETED	12.98	2026-05-28 00:41:50.766	cmq118vvn006pcuonlwldds1o
cmq324bmp00dv12padq5sic9x	cmq118uq30001cuonmbe5ypw9	cmq118uv7002gcuon6lhcw95h	cmq1192k90077cuoni2akrh82	\N	SERVED	34.48	2026-06-05 00:41:50.304	cmq118vvn006pcuonlwldds1o
cmq324bmz00e012pazqxsy3dq	cmq118uq30001cuonmbe5ypw9	cmq118uv9002icuonspu3jkki	cmq1192k90077cuoni2akrh82	\N	SERVED	12.98	2026-06-06 00:41:50.314	cmq118vvn006pcuonlwldds1o
cmq324bgy00be12pahzxng0mk	cmq118upo0000cuonozp6ur0p	cmq118uuh001ucuonwbf7k0q8	cmq118ysb006xcuon40u695ve	\N	SERVED	13.48	2026-06-04 00:41:50.096	cmq118vvn006pcuonlwldds1o
cmq324bh600bj12pa7us5az3h	cmq118upo0000cuonozp6ur0p	cmq118uuj001wcuonuwsksmcn	cmq118ysb006xcuon40u695ve	\N	SERVED	34.48	2026-06-05 00:41:50.104	cmq118vvn006pcuonlwldds1o
cmq324bhk00bo12padipp3jwa	cmq118upo0000cuonozp6ur0p	cmq118uul001ycuona30w3hdl	cmq118ysb006xcuon40u695ve	\N	SERVED	12.98	2026-06-06 00:41:50.119	cmq118vvn006pcuonlwldds1o
cmq324bld00d512pa546cooz8	cmq118uq30001cuonmbe5ypw9	cmq118uuy0028cuonigrja4bw	cmq1192k90077cuoni2akrh82	\N	PAID	13.48	2026-06-01 00:41:50.255	cmq118vvn006pcuonlwldds1o
cmq324blq00dc12paut5zrkvd	cmq118uq30001cuonmbe5ypw9	cmq118uv0002acuonz0h8p5yf	cmq1192k90077cuoni2akrh82	\N	PAID	34.48	2026-06-02 00:41:50.269	cmq118vvn006pcuonlwldds1o
cmq324bm700dj12pavocq8w1y	cmq118uq30001cuonmbe5ypw9	cmq118uv3002ccuonzc145hqm	cmq1192k90077cuoni2akrh82	\N	PAID	12.98	2026-06-03 00:41:50.285	cmq118vvn006pcuonlwldds1o
cmq324bfz00at12pa0lhw1vf0	cmq118upo0000cuonozp6ur0p	cmq118uua001ocuonacw64k87	cmq118ysb006xcuon40u695ve	\N	PAID	13.48	2026-06-01 00:41:50.061	cmq118vvn006pcuonlwldds1o
cmq324bgc00b012paqcp5mfr7	cmq118upo0000cuonozp6ur0p	cmq118uud001qcuonvtlc483q	cmq118ysb006xcuon40u695ve	\N	PAID	34.48	2026-06-02 00:41:50.075	cmq118vvn006pcuonlwldds1o
cmq324bzx00jk12pa4lgtp0hs	cmq118uqc0004cuonac33ndz8	cmq118uwy003qcuonl39cy2iq	cmq119d9j0081cuon2flvofg7	\N	COMPLETED	13.48	2026-05-29 00:41:50.779	cmq118vvn006pcuonlwldds1o
cmq324c0c00jr12pac5mvutri	cmq118uqc0004cuonac33ndz8	cmq118ux0003scuonccpx7xl8	cmq119d9j0081cuon2flvofg7	\N	COMPLETED	34.48	2026-05-30 00:41:50.794	cmq118vvn006pcuonlwldds1o
cmq324c0s00jy12pa5e3l6041	cmq118uqc0004cuonac33ndz8	cmq118ux2003ucuon7k8mxzeq	cmq119d9j0081cuon2flvofg7	\N	COMPLETED	12.98	2026-05-31 00:41:50.81	cmq118vvn006pcuonlwldds1o
cmq324c1700k512pax48gqglg	cmq118uqc0004cuonac33ndz8	cmq118ux4003wcuonrms6a01i	cmq119d9j0081cuon2flvofg7	\N	SERVED	13.48	2026-06-01 00:41:50.826	cmq118vvn006pcuonlwldds1o
cmq324c1i00kc12paghu3tegz	cmq118uqc0004cuonac33ndz8	cmq118ux7003ycuonczgkc93y	cmq119d9j0081cuon2flvofg7	\N	SERVED	34.48	2026-06-02 00:41:50.837	cmq118vvn006pcuonlwldds1o
cmq324c1y00kj12paryz18z7n	cmq118uqc0004cuonac33ndz8	cmq118ux90040cuonjym8saxy	cmq119d9j0081cuon2flvofg7	\N	SERVED	12.98	2026-06-03 00:41:50.853	cmq118vvn006pcuonlwldds1o
cmq324c2b00kq12pajtirgk1j	cmq118uqc0004cuonac33ndz8	cmq118uxb0042cuonh510f7i9	cmq119d9j0081cuon2flvofg7	\N	PENDING	13.48	2026-06-04 00:41:50.866	cmq118vvn006pcuonlwldds1o
cmq324c2g00kv12pal6tk8da0	cmq118uqc0004cuonac33ndz8	cmq118uxd0044cuong2r13kzz	cmq119d9j0081cuon2flvofg7	\N	PENDING	34.48	2026-06-05 00:41:50.871	cmq118vvn006pcuonlwldds1o
cmq324c2v00l012paqjt4ycr7	cmq118uqc0004cuonac33ndz8	cmq118uxf0046cuon1osuct06	cmq119d9j0081cuon2flvofg7	\N	PENDING	12.98	2026-06-06 00:41:50.886	cmq118vvn006pcuonlwldds1o
cmq324bmh00dq12pay52yltf6	cmq118uq30001cuonmbe5ypw9	cmq118uv5002ecuoneoh4rbur	cmq1192k90077cuoni2akrh82	\N	SERVED	13.48	2026-06-04 00:41:50.296	cmq118vvn006pcuonlwldds1o
cmq42blo000099eoa1zxbl6lf	cmq118uqc0004cuonac33ndz8	\N	\N	\N	PENDING	41.97	2026-06-07 17:35:16.079	cmq118vvn006pcuonlwldds1o
cmq49jxyy000cvmsjpxfopnnv	cmq118uq30001cuonmbe5ypw9	\N	\N	\N	SERVED	10.48	2026-06-07 20:57:42.586	cmq118vvn006pcuonlwldds1o
cmq50y1450003kjudaekt09kq	cmq118uq30001cuonmbe5ypw9	\N	\N	\N	SERVED	28.99	2026-06-08 09:44:29.477	cmq118vvn006pcuonlwldds1o
cmq826tel0005hajqhnietvx5	cmq118upo0000cuonozp6ur0p	\N	\N	\N	SERVED	28.99	2026-06-10 12:42:37.533	cmq118vvn006pcuonlwldds1o
cmq5144wf0013kjudx8fxheyz	cmq118uq30001cuonmbe5ypw9	\N	\N	\N	SERVED	28.99	2026-06-08 09:49:14.319	cmq118vvn006pcuonlwldds1o
cmq4eulq6000d3vhiv2qkyo4b	cmq118uq30001cuonmbe5ypw9	\N	\N	\N	SERVED	70.98	2026-06-07 23:25:58.014	cmq118vvn006pcuonlwldds1o
cmq4cwi3r00032y1szn718m08	cmq118uq30001cuonmbe5ypw9	\N	\N	\N	PAID	60.98	2026-06-07 22:31:27.399	cmq118vvn006pcuonlwldds1o
cmq4zvvy0000byb4ynxvkq9eg	cmq118upo0000cuonozp6ur0p	cmq118utx001gcuonyc893lw2	cmq118ysb006xcuon40u695ve	\N	SERVED	4.99	2026-06-08 09:14:49.848	\N
cmq526uhw0003k8ydpwm8qo6k	cmq118upo0000cuonozp6ur0p	\N	\N	\N	PAID	31.99	2026-06-08 10:19:20.412	cmq118vvn006pcuonlwldds1o
cmq504p1s0017yb4yvxrpi3hs	cmq118uq30001cuonmbe5ypw9	\N	\N	\N	SERVED	28.99	2026-06-08 09:21:40.816	cmq118vvn006pcuonlwldds1o
cmq8isjwr000bfx7ly8zq4enq	cmq118upo0000cuonozp6ur0p	\N	\N	\N	PAID	31.99	2026-06-10 20:27:25.514	cmq118vvn006pcuonlwldds1o
cmq4847u7000d12zslznwi1dl	cmq118uq30001cuonmbe5ypw9	\N	\N	\N	SERVED	89.96	2026-06-07 20:17:29.263	cmq118vvn006pcuonlwldds1o
cmq52pzyt000nk8yduz35shla	cmq118uqc0004cuonac33ndz8	\N	\N	\N	ON_TABLE	28.99	2026-06-08 10:34:13.973	cmq118vvn006pcuonlwldds1o
cmq7ae0j9002bz1m1kojtph7q	cmq118upo0000cuonozp6ur0p	\N	\N	\N	SERVED	60.98	2026-06-09 23:44:24.117	cmq118vvn006pcuonlwldds1o
cmq7qu72l0030z1m1j2rsio8t	cmq118upo0000cuonozp6ur0p	\N	\N	\N	SERVED	28.99	2026-06-10 07:24:52.923	cmq118vvn006pcuonlwldds1o
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderItem" (id, "orderId", "menuItemId", quantity, "unitPrice") FROM stdin;
cmq324be900a312papqrpuvnl	cmq324be900a112pa2p9m8dkj	cmq118urc000ccuon8w5vta72	1	4.99
cmq324be900a412pardsi9l3y	cmq324be900a112pa2p9m8dkj	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bex00aa12paj6f3h7wg	cmq324bex00a812pa3ina5ch0	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bex00ab12pam5j1ipop	cmq324bex00a812pa3ina5ch0	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bf800ah12pa59xlave7	cmq324bf700af12pa2sva0cd9	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bf800ai12pa90g0mlt3	cmq324bf700af12pa2sva0cd9	cmq118uru000icuong6395ewb	1	28.99
cmq324bfi00ao12pap5ohxmfo	cmq324bfi00am12pau1mo6dgs	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bfi00ap12paggmz5uy2	cmq324bfi00am12pau1mo6dgs	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bfz00av12paiarxdr6u	cmq324bfz00at12pa0lhw1vf0	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bfz00aw12pazellbeo1	cmq324bfz00at12pa0lhw1vf0	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bgd00b212paa4l5b6vk	cmq324bgc00b012paqcp5mfr7	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bgd00b312paexp3k3jd	cmq324bgc00b012paqcp5mfr7	cmq118uru000icuong6395ewb	1	28.99
cmq324bgm00b912paeosxhzfv	cmq324bgm00b712pawkiegnfl	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bgm00ba12pamkhjzrf8	cmq324bgm00b712pawkiegnfl	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bgy00bg12pafi2g9k1o	cmq324bgy00be12pahzxng0mk	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bgy00bh12pachrmtqme	cmq324bgy00be12pahzxng0mk	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bh600bl12papl5xyu0w	cmq324bh600bj12pa7us5az3h	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bh600bm12parhcui4f5	cmq324bh600bj12pa7us5az3h	cmq118uru000icuong6395ewb	1	28.99
cmq324bhk00bq12pakzyyelfn	cmq324bhk00bo12padipp3jwa	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bhk00br12pa82mf2odr	cmq324bhk00bo12padipp3jwa	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bjx00cf12paooxx87bq	cmq324bjx00cd12pajkcb4xos	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bjy00cg12paqzuwvn48	cmq324bjx00cd12pajkcb4xos	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bk700cm12pafeypdfxw	cmq324bk700ck12par95rpsy3	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bk700cn12paqqneyynv	cmq324bk700ck12par95rpsy3	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bkl00ct12pa1ktgoi8k	cmq324bkl00cr12paqg7q5ja3	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bkl00cu12pawssozhfk	cmq324bkl00cr12paqg7q5ja3	cmq118uru000icuong6395ewb	1	28.99
cmq324bkz00d012pa021rtjzq	cmq324bkz00cy12pa6kalhrer	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bkz00d112pag87uf2jw	cmq324bkz00cy12pa6kalhrer	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bld00d712pa5illxp73	cmq324bld00d512pa546cooz8	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bld00d812paqmavmq96	cmq324bld00d512pa546cooz8	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324blq00de12paboka4qbc	cmq324blq00dc12paut5zrkvd	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324blq00df12pajemfxpg6	cmq324blq00dc12paut5zrkvd	cmq118uru000icuong6395ewb	1	28.99
cmq324bm700dl12paqb75vq0a	cmq324bm700dj12pavocq8w1y	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bm700dm12pa9s39bvfh	cmq324bm700dj12pavocq8w1y	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bmh00ds12pao4vxjyx3	cmq324bmh00dq12pay52yltf6	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bmh00dt12paazstimzc	cmq324bmh00dq12pay52yltf6	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bmp00dx12pamvcb93bg	cmq324bmp00dv12padq5sic9x	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bmp00dy12pappgsjvga	cmq324bmp00dv12padq5sic9x	cmq118uru000icuong6395ewb	1	28.99
cmq324bmz00e212paroe71atu	cmq324bmz00e012pazqxsy3dq	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bmz00e312pamctbrkk3	cmq324bmz00e012pazqxsy3dq	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bod00er12pa280n5b3x	cmq324bod00ep12paipgv03l9	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bod00es12panrmdmyoz	cmq324bod00ep12paipgv03l9	cmq118urk000ecuondvbvzr74	1	7.99
cmq324boo00ey12paydukawqs	cmq324boo00ew12pao7ngu4l9	cmq118urk000ecuondvbvzr74	1	7.99
cmq324boo00ez12pa0pdki0qq	cmq324boo00ew12pao7ngu4l9	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324boz00f512paaifo870v	cmq324boz00f312palu845c0u	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324boz00f612pa9akvp6yn	cmq324boz00f312palu845c0u	cmq118uru000icuong6395ewb	1	28.99
cmq324bpf00fc12pav7ay8bj3	cmq324bpf00fa12paeapu1x43	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bpf00fd12pansm5ryrk	cmq324bpf00fa12paeapu1x43	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bpp00fj12parivv0jby	cmq324bpo00fh12pa928npyl3	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bpp00fk12pac97b1s5z	cmq324bpo00fh12pa928npyl3	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bq500fq12pa2bvgbe9g	cmq324bq500fo12pa45gx4nv0	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bq500fr12pahj6c9xkr	cmq324bq500fo12pa45gx4nv0	cmq118uru000icuong6395ewb	1	28.99
cmq324bqg00fx12pas26eqtvt	cmq324bqg00fv12paw5mw1r4h	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bqg00fy12pad3ovltfj	cmq324bqg00fv12paw5mw1r4h	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bqy00g412padw0116yr	cmq324bqx00g212pak468p7p1	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bqy00g512paap3ms6sr	cmq324bqx00g212pak468p7p1	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324brd00g912patnzdzkdf	cmq324brd00g712pamwi84ed6	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324brd00ga12pasjas4ef2	cmq324brd00g712pamwi84ed6	cmq118uru000icuong6395ewb	1	28.99
cmq324brt00ge12paf1s39jkx	cmq324brt00gc12palnvi7sl3	cmq118urc000ccuon8w5vta72	1	4.99
cmq324brt00gf12pabl4hkeju	cmq324brt00gc12palnvi7sl3	cmq118urk000ecuondvbvzr74	1	7.99
cmq324btk00h312pa8basume1	cmq324btk00h112pahy0zh3vr	cmq118urc000ccuon8w5vta72	1	4.99
cmq324btk00h412palg2ohhv1	cmq324btk00h112pahy0zh3vr	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bty00ha12pa0qy6ffur	cmq324bty00h812pa7i7l2x4h	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bty00hb12paf81niguc	cmq324bty00h812pa7i7l2x4h	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324buh00hh12paw7gzswpt	cmq324bug00hf12pa3zo9593s	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324buh00hi12pa4dughd1w	cmq324bug00hf12pa3zo9593s	cmq118uru000icuong6395ewb	1	28.99
cmq324bv200ho12pax8hvw3zo	cmq324bv200hm12pafbqyhv45	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bv200hp12pafyjcesqu	cmq324bv200hm12pafbqyhv45	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bvj00hv12panthx4pw4	cmq324bvj00ht12patpwfs5pf	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bvj00hw12pafi6faumf	cmq324bvj00ht12patpwfs5pf	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bvy00i212pa58vp4r23	cmq324bvy00i012pa7e64rsk9	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bvy00i312pa4objmk2m	cmq324bvy00i012pa7e64rsk9	cmq118uru000icuong6395ewb	1	28.99
cmq324bwe00i912paxkmjvpjm	cmq324bwe00i712pa4i6yjoqx	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bwe00ia12paerl5fs0i	cmq324bwe00i712pa4i6yjoqx	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bwv00ig12pab2ptxndw	cmq324bwv00ie12paa4rz61x4	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bwv00ih12pal72hi8wz	cmq324bwv00ie12paa4rz61x4	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bxd00il12pal3yod81k	cmq324bxd00ij12pa24pxf7y3	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324bxd00im12pasjdx4s7c	cmq324bxd00ij12pa24pxf7y3	cmq118uru000icuong6395ewb	1	28.99
cmq324bxq00iq12pagj96hffb	cmq324bxq00io12pagmljwtzk	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bxq00ir12palpde3k7y	cmq324bxq00io12pagmljwtzk	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bzj00jf12paodafwjjk	cmq324bzj00jd12pa8a7s1we5	cmq118urc000ccuon8w5vta72	1	4.99
cmq324bzj00jg12pak9hppacx	cmq324bzj00jd12pa8a7s1we5	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bzx00jm12pazkr4f80a	cmq324bzx00jk12pa4lgtp0hs	cmq118urk000ecuondvbvzr74	1	7.99
cmq324bzx00jn12pabldu77pg	cmq324bzx00jk12pa4lgtp0hs	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324c0c00jt12pay5pn4jvu	cmq324c0c00jr12pac5mvutri	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324c0c00ju12paunic2rtd	cmq324c0c00jr12pac5mvutri	cmq118uru000icuong6395ewb	1	28.99
cmq324c0s00k012paccxrdtxp	cmq324c0s00jy12pa5e3l6041	cmq118urc000ccuon8w5vta72	1	4.99
cmq324c0s00k112pacpr3neba	cmq324c0s00jy12pa5e3l6041	cmq118urk000ecuondvbvzr74	1	7.99
cmq324c1700k712paj0dvx460	cmq324c1700k512pax48gqglg	cmq118urk000ecuondvbvzr74	1	7.99
cmq324c1700k812paj7641v7k	cmq324c1700k512pax48gqglg	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324c1i00ke12pa4yczyzie	cmq324c1i00kc12paghu3tegz	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324c1j00kf12pale6nab7e	cmq324c1i00kc12paghu3tegz	cmq118uru000icuong6395ewb	1	28.99
cmq324c1y00kl12panrgp8964	cmq324c1y00kj12paryz18z7n	cmq118urc000ccuon8w5vta72	1	4.99
cmq324c1y00km12pajmmh9zve	cmq324c1y00kj12paryz18z7n	cmq118urk000ecuondvbvzr74	1	7.99
cmq324c2b00ks12paklnmozjs	cmq324c2b00kq12pajtirgk1j	cmq118urk000ecuondvbvzr74	1	7.99
cmq324c2b00kt12pa8z3aoyer	cmq324c2b00kq12pajtirgk1j	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324c2g00kx12parw1e9ljb	cmq324c2g00kv12pal6tk8da0	cmq118urq000gcuon91rm9f5a	1	5.49
cmq324c2g00ky12paqr1qw5mw	cmq324c2g00kv12pal6tk8da0	cmq118uru000icuong6395ewb	1	28.99
cmq324c2w00l212parkdokuis	cmq324c2v00l012paqjt4ycr7	cmq118urc000ccuon8w5vta72	1	4.99
cmq324c2w00l312pahiizdgx3	cmq324c2v00l012paqjt4ycr7	cmq118urk000ecuondvbvzr74	1	7.99
cmq42blo0000b9eoa510njdyx	cmq42blo000099eoa1zxbl6lf	cmq118urc000ccuon8w5vta72	1	4.99
cmq42blo0000c9eoa9egbdogr	cmq42blo000099eoa1zxbl6lf	cmq118urk000ecuondvbvzr74	1	7.99
cmq42blo0000d9eoa9cxhqxbu	cmq42blo000099eoa1zxbl6lf	cmq118uru000icuong6395ewb	1	28.99
cmq4847u9000f12zsxe6df6rl	cmq4847u7000d12zslznwi1dl	cmq118urc000ccuon8w5vta72	1	4.99
cmq4847u9000g12zs8afsu04v	cmq4847u7000d12zslznwi1dl	cmq118ury000kcuonlt36g9j9	1	31.99
cmq4847u9000h12zsxbncjfy1	cmq4847u7000d12zslznwi1dl	cmq118us3000mcuong5focegw	1	38.99
cmq4847u9000i12zswbpc5ijm	cmq4847u7000d12zslznwi1dl	cmq118usc000qcuon3ygq4zqc	1	13.99
cmq49jxyz000evmsjwic0szkx	cmq49jxyy000cvmsjpxfopnnv	cmq118urq000gcuon91rm9f5a	1	5.49
cmq49jxyz000fvmsjqbaar9ou	cmq49jxyy000cvmsjpxfopnnv	cmq118urc000ccuon8w5vta72	1	4.99
cmq4cwi3r00052y1skjjk5y16	cmq4cwi3r00032y1szn718m08	cmq118uru000icuong6395ewb	1	28.99
cmq4cwi3r00062y1s7ey9thrb	cmq4cwi3r00032y1szn718m08	cmq118ury000kcuonlt36g9j9	1	31.99
cmq4eulq6000f3vhio9ujfom4	cmq4eulq6000d3vhiv2qkyo4b	cmq118ury000kcuonlt36g9j9	1	31.99
cmq4eulq6000g3vhi4vj1d7tn	cmq4eulq6000d3vhiv2qkyo4b	cmq118us3000mcuong5focegw	1	38.99
cmq4zvvy0000dyb4yc5sanui5	cmq4zvvy0000byb4ynxvkq9eg	cmq118urc000ccuon8w5vta72	1	4.99
cmq504p1s0019yb4y60uq7rsi	cmq504p1s0017yb4yvxrpi3hs	cmq118uru000icuong6395ewb	1	28.99
cmq50y1450005kjudvtmcyfqa	cmq50y1450003kjudaekt09kq	cmq118uru000icuong6395ewb	1	28.99
cmq5144wf0015kjuda1t8cfog	cmq5144wf0013kjudx8fxheyz	cmq118uru000icuong6395ewb	1	28.99
cmq526ukv0005k8yd6d4h2gzv	cmq526uhw0003k8ydpwm8qo6k	cmq118ury000kcuonlt36g9j9	1	31.99
cmq52pzyt000pk8ydfzzycfhu	cmq52pzyt000nk8yduz35shla	cmq118uru000icuong6395ewb	1	28.99
cmq7ae0j9002dz1m1hu5qh35j	cmq7ae0j9002bz1m1kojtph7q	cmq118uru000icuong6395ewb	1	28.99
cmq7ae0j9002ez1m1v228kwce	cmq7ae0j9002bz1m1kojtph7q	cmq118ury000kcuonlt36g9j9	1	31.99
cmq7qu72l0032z1m18jhgxjey	cmq7qu72l0030z1m1j2rsio8t	cmq118uru000icuong6395ewb	1	28.99
cmq826tel0007hajqxfl9ih95	cmq826tel0005hajqhnietvx5	cmq118uru000icuong6395ewb	1	28.99
cmq8isjwr000dfx7lgfv6fmau	cmq8isjwr000bfx7ly8zq4enq	cmq118ury000kcuonlt36g9j9	1	31.99
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payment" (id, "orderId", amount, method, status, "createdAt") FROM stdin;
cmq324beq00a612pav28t16s3	cmq324be900a112pa2p9m8dkj	12.98	CARD	COMPLETED	2026-05-28 00:41:49.998
cmq324bf400ad12paans49zp6	cmq324bex00a812pa3ina5ch0	13.48	CASH	COMPLETED	2026-05-29 00:41:50.023
cmq324bff00ak12paj043g92b	cmq324bf700af12pa2sva0cd9	34.48	CONTACTLESS	COMPLETED	2026-05-30 00:41:50.034
cmq324bfs00ar12panij47ysy	cmq324bfi00am12pau1mo6dgs	12.98	CARD	COMPLETED	2026-05-31 00:41:50.045
cmq324bg900ay12pafzhcl5ou	cmq324bfz00at12pa0lhw1vf0	13.48	CASH	COMPLETED	2026-06-01 00:41:50.061
cmq324bgj00b512pa7kxbo97n	cmq324bgc00b012paqcp5mfr7	34.48	CONTACTLESS	COMPLETED	2026-06-02 00:41:50.075
cmq324bgu00bc12pa84sb6plp	cmq324bgm00b712pawkiegnfl	12.98	CARD	COMPLETED	2026-06-03 00:41:50.085
cmq324bk400ci12pabktyozue	cmq324bjx00cd12pajkcb4xos	12.98	CARD	COMPLETED	2026-05-28 00:41:50.204
cmq324bki00cp12pae2z3mfc2	cmq324bk700ck12par95rpsy3	13.48	CASH	COMPLETED	2026-05-29 00:41:50.214
cmq324bkv00cw12pax23ohc8r	cmq324bkl00cr12paqg7q5ja3	34.48	CONTACTLESS	COMPLETED	2026-05-30 00:41:50.228
cmq324bl600d312pawt1m1djl	cmq324bkz00cy12pa6kalhrer	12.98	CARD	COMPLETED	2026-05-31 00:41:50.242
cmq324blk00da12pa49pumjm0	cmq324bld00d512pa546cooz8	13.48	CASH	COMPLETED	2026-06-01 00:41:50.255
cmq324bm300dh12pa7tkkjlyv	cmq324blq00dc12paut5zrkvd	34.48	CONTACTLESS	COMPLETED	2026-06-02 00:41:50.269
cmq324bme00do12pab9ddmnst	cmq324bm700dj12pavocq8w1y	12.98	CARD	COMPLETED	2026-06-03 00:41:50.285
cmq324boj00eu12paz523nlzu	cmq324bod00ep12paipgv03l9	12.98	CARD	COMPLETED	2026-05-28 00:41:50.364
cmq324bow00f112pa5imodnmr	cmq324boo00ew12pao7ngu4l9	13.48	CASH	COMPLETED	2026-05-29 00:41:50.374
cmq324bpc00f812paaibtd7vw	cmq324boz00f312palu845c0u	34.48	CONTACTLESS	COMPLETED	2026-05-30 00:41:50.385
cmq324bpm00ff12patbz229n4	cmq324bpf00fa12paeapu1x43	12.98	CARD	COMPLETED	2026-05-31 00:41:50.402
cmq324bpy00fm12pacruirho4	cmq324bpo00fh12pa928npyl3	13.48	CASH	COMPLETED	2026-06-01 00:41:50.411
cmq324bqd00ft12pai2axr2ge	cmq324bq500fo12pa45gx4nv0	34.48	CONTACTLESS	COMPLETED	2026-06-02 00:41:50.428
cmq324bqu00g012pa6v2vul5q	cmq324bqg00fv12paw5mw1r4h	12.98	CARD	COMPLETED	2026-06-03 00:41:50.438
cmq324btv00h612pawzmxvrqb	cmq324btk00h112pahy0zh3vr	12.98	CARD	COMPLETED	2026-05-28 00:41:50.55
cmq324bu800hd12pap8f6pgr6	cmq324bty00h812pa7i7l2x4h	13.48	CASH	COMPLETED	2026-05-29 00:41:50.565
cmq324buz00hk12palsjwsb2q	cmq324bug00hf12pa3zo9593s	34.48	CONTACTLESS	COMPLETED	2026-05-30 00:41:50.583
cmq324bvd00hr12pad6ly0v18	cmq324bv200hm12pafbqyhv45	12.98	CARD	COMPLETED	2026-05-31 00:41:50.605
cmq324bvv00hy12paar4rscen	cmq324bvj00ht12patpwfs5pf	13.48	CASH	COMPLETED	2026-06-01 00:41:50.622
cmq324bw700i512payuum23bh	cmq324bvy00i012pa7e64rsk9	34.48	CONTACTLESS	COMPLETED	2026-06-02 00:41:50.637
cmq324bws00ic12pabi2wndsg	cmq324bwe00i712pa4i6yjoqx	12.98	CARD	COMPLETED	2026-06-03 00:41:50.653
cmq324bzp00ji12pay7gxo1oc	cmq324bzj00jd12pa8a7s1we5	12.98	CARD	COMPLETED	2026-05-28 00:41:50.766
cmq324c0900jp12pav2pupaiz	cmq324bzx00jk12pa4lgtp0hs	13.48	CASH	COMPLETED	2026-05-29 00:41:50.779
cmq324c0p00jw12pa42s52bt2	cmq324c0c00jr12pac5mvutri	34.48	CONTACTLESS	COMPLETED	2026-05-30 00:41:50.794
cmq324c1300k312patwldr7xc	cmq324c0s00jy12pa5e3l6041	12.98	CARD	COMPLETED	2026-05-31 00:41:50.81
cmq324c1g00ka12pa4degot1u	cmq324c1700k512pax48gqglg	13.48	CASH	COMPLETED	2026-06-01 00:41:50.826
cmq324c1w00kh12pakfvo27gb	cmq324c1i00kc12paghu3tegz	34.48	CONTACTLESS	COMPLETED	2026-06-02 00:41:50.837
cmq324c2900ko12pa38n1cktu	cmq324c1y00kj12paryz18z7n	12.98	CARD	COMPLETED	2026-06-03 00:41:50.853
\.


--
-- Data for Name: Receipt; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Receipt" (id, "orderId", "branchId", "uploadedById", filename, "mimeType", data, "createdAt") FROM stdin;
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RefreshToken" (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
cmq1405i600019ezbfz7euwhf	cb3f88d98ec5b3d9fa3c014ad01f686b2d962779a24a05c35d8e5839bcafe319f27c5bed4bf76fe015566bc756ea7cf9450d55bd9b9f9116ffe5f91178ef19a1	cmq118wjr006rcuonhrh7mqpj	2026-06-12 15:59:02.612	2026-06-05 15:59:02.617
cmq9ci2ps000vfx7l14bb0b2j	f50ea332a9cc97cb3a3805b0e29b605a13ac7b42b5d7a7bb94ab4cc9c0a0a1bbaf993821b20edb97ebfd50c35c1e7526d1c6c7b15b7d817b2f383813ce0465af	cmq118wjr006rcuonhrh7mqpj	2026-06-18 10:19:05.151	2026-06-11 10:19:05.152
cmq42n8sk0001r50x13w8mf5r	15e0315fd2a41540c75bb0f53dba5c25991fda6656e49c1139f5e39dd0804482614e8a2294e16efac8d82f08b83833543b3eec1d179c88b6f5c710079b2c729f	cmq118ysb006xcuon40u695ve	2026-06-14 17:44:19.267	2026-06-07 17:44:19.268
cmq42of650001kwoznm5eup9f	acde6c8e2e7468c8207f6a71e38e359b7b3f31efdaa3d4f2c87983ac70f16ed3a9f64b566099a26cec577555aff879ca98d6ee1cbd9996c3f227bfc0d3440878	cmq118ysb006xcuon40u695ve	2026-06-14 17:45:14.187	2026-06-07 17:45:14.189
cmq42owvu0003kwozp2rvo4wj	89ee7a655599f033669ac61024dfa7e47584ee5a3abf142ac26e7bb65cdf43751934511bc24ad597483ea671d9138e806c0d7d2d731fda7e044f6532c7581614	cmq118ysb006xcuon40u695ve	2026-06-14 17:45:37.144	2026-06-07 17:45:37.146
cmq42oxpg0005kwozd121e7gi	f665b9742488cda7a4ddb497b8d089200e14afd2b2f0f9babafa17b254f3085c879202580f1e4578820bc26e17140eadf40c055e0eb3613a2feea11a35f37d4d	cmq1192k90077cuoni2akrh82	2026-06-14 17:45:38.211	2026-06-07 17:45:38.213
cmq1a3cii000k9ezbdn0zrrcm	98d16b63f9b3debec3501996e2169a83884ccb7543ae524560233af833993f82de4d41c5838aab13c4d8f69b96b363ef079b1a9556bcf2cbf282432cd9e4b1be	cmq1195gj007fcuon74t4wd4g	2026-06-12 18:49:29.366	2026-06-05 18:49:29.37
cmq42oylt0007kwozfcpg2v3s	ee4f4ed8ffe19ad00924b765f154e8e19992eef3def71475147f1869f8ea266ddd96ce881ee379c775e1108e4564b2450d1daf8eb8f94d51cb8b79afc22b0692	cmq11965n007hcuon020rnbvi	2026-06-14 17:45:39.376	2026-06-07 17:45:39.378
cmq42ozes0009kwozatxpzgda	f0eacf0ae869851605187638ddff6d2b5967264d1c0e7b910ac2bdcf7fe8b9d818518eb2db0f2580f5fdbb6cda2126d2146738157cb8493b196c3893ae4990c8	cmq1199wb007rcuon23bw9ej6	2026-06-14 17:45:40.419	2026-06-07 17:45:40.421
cmq42p08i000bkwoz68n5x8rn	3920c6eebd903d0ad333a7ee5928357046d0f2899f489e5018c8508bc0810090d86d5ec97d1714fb770f9c4ea24cc52d2cf93b6a99e71a28b1c09b440ba135b9	cmq119d9j0081cuon2flvofg7	2026-06-14 17:45:41.489	2026-06-07 17:45:41.491
cmq42pbq3000dkwoz0wxwq317	f58e8a905df39adf16267c23c837f4d07a8febcc70dc122e607eb3b7a1eb1cb1b68248d9505ad008a991f4c4f95cce2c8fea38d898f937466fb7798023e55adf	cmq118ysb006xcuon40u695ve	2026-06-14 17:45:56.377	2026-06-07 17:45:56.379
cmq42pdir000fkwozais8lq0f	2013447d85cff818655279165023eb1f302910c618a070f616e60d1ada1aa29ad973c2a477f465a7d7367d47eaedafbf9e8f86b743a079153f80f9e78c4d2cbe	cmq1192k90077cuoni2akrh82	2026-06-14 17:45:58.705	2026-06-07 17:45:58.707
cmq2st87m0009uy83gunkcwtv	19171d132dc696bee7fa7d0e5683049d39dc4dbf8074fe933635f83ae321f86847cc258ff3b01a4f7df7f1017b0b8b904d56afd2669c013a7a6105ecb124cc55	cmq118vvn006pcuonlwldds1o	2026-06-13 20:21:16.112	2026-06-06 20:21:16.114
cmq42pexf000hkwozr6bi1re2	a1c62e27a781ec3fb2e6d08845d95135de50913d487856f4eb8d8c0e98bc21d78b716c27ea848522467800dd5a859895c1283d6b5c79c4d0270065391c5767f7	cmq11965n007hcuon020rnbvi	2026-06-14 17:46:00.53	2026-06-07 17:46:00.531
cmq42pg6x000jkwozpa1ixx0z	89c973ed544d590af687678190313f4fcdcc137d4683b3721841aff77824449ee7f97d18f23b17688bec65b025e1c0e829b7c5f4f7fe4cbef720f0d368dbebdb	cmq1199wb007rcuon23bw9ej6	2026-06-14 17:46:02.168	2026-06-07 17:46:02.169
cmq42php1000lkwozapd0hfl4	bda05045103fdcca7af8600e9ac2f63a842febb7e999c025e8032b9610917c00355b9f33c4931524c3dd0b01c05ddd510aee2ef1634fa91905e5734ceff3695d	cmq119d9j0081cuon2flvofg7	2026-06-14 17:46:04.116	2026-06-07 17:46:04.117
cmq42pj7f000nkwozh5wpfdfl	4dda37a0184c3ee995c9dac381a670006c7dc208b421280bfe7b5da245e85b3dd8b27dc2713ab732a4cec510847ca4fa823bdc3316672021794016e97e46b92b	cmq1190do0071cuonhxlmvbeo	2026-06-14 17:46:06.074	2026-06-07 17:46:06.075
cmq42pkry000pkwozzo3mixjc	587aa4acb9db36dc7441b4c5fa52fc4ba84e31d8a7c3e543f97a958ba281a5ea74dbbff61ddf90b8c00d45d43845a6a707b89bbd3960d1f313023d00a4128e65	cmq118y1o006vcuonry5z7sgx	2026-06-14 17:46:08.109	2026-06-07 17:46:08.111
cmq47hihw000112zsf1191k8z	564e11958ffd108cb58ddc0da22709864b7ed6b808fdc748f8b9f0d7721c1340513431e1e82654b11eb2239bc8285cb34b613ad579353178a2a97b95d7bf2bcd	cmq118wjr006rcuonhrh7mqpj	2026-06-14 19:59:49.984	2026-06-07 19:59:49.986
cmq2y88yl000dubpv7e4vllv3	ff7e358de96c57498f2e8b8d5da268ada9aab1b1961fc2cec30b2daa610388c59f7c87b1f6187772bcdb19f289722b36e3fa60af62a81ad2ab5119d0b37d2fd0	cmq118wjr006rcuonhrh7mqpj	2026-06-13 22:52:55.004	2026-06-06 22:52:55.005
cmq3l2ll10009iuexgohqofva	4811793ab60a3666b0a82efbbd5bc9696ab82b95321ea719fea155019d950cacad6086652098ed5b6486440ac432c5d1d790da0596104bd4535d368fc395aff4	cmq1192k90077cuoni2akrh82	2026-06-14 09:32:22.596	2026-06-07 09:32:22.598
cmq49wm6a000yvmsjo58aehrt	5f77a744953dac0d1c6576c966c311bcf2d67e292eb164426ea0dbb4c9b0c0262ce34707a457a10a3e51480c5aa915ad82a9091c8a0d6304aa732d74c8affd26	cmq1192k90077cuoni2akrh82	2026-06-14 21:07:33.825	2026-06-07 21:07:33.826
cmq3mkvzc000y2ib1taklpx1g	21dec9fd521182da59c4f33374693468bddae217609916e434594fa95f94a59dec89a1481cd045efc6b0fc23796c46026a43019abf01b7d9d35b2fab3ad8f472	cmq118vvn006pcuonlwldds1o	2026-06-14 10:14:35.495	2026-06-07 10:14:35.497
cmq3necwr00017dw17k0fdqyi	d040a6816471e495468788e268fae08e5e5efe292c6241add0c438305b35c82357a6281420b659bda19842d6a6b22f16cec73c5c739b338ea417e2f6f8123408	cmq118wjr006rcuonhrh7mqpj	2026-06-14 10:37:30.456	2026-06-07 10:37:30.459
cmq3nekhu00037dw1t1cpmqm6	4988fb65cfd1358aace4c4263ca9b2c915b6169f9589285e59a8e41b04e47c346fa80d34cfa3ee1a9c63a6630ce5186610b788c2531f9e0f684246329130429f	cmq118wjr006rcuonhrh7mqpj	2026-06-14 10:37:40.288	2026-06-07 10:37:40.29
cmq3nevnu00057dw1zdxcce70	327984a79fec184e8d32df39d4c78922b7540701173e507a28d2f00b72fe41e0feb3047b39fba00d9e62050de4c61909789ae92b256badf144248830a8925119	cmq118wjr006rcuonhrh7mqpj	2026-06-14 10:37:54.76	2026-06-07 10:37:54.762
cmq3nf3g400077dw13od90tjx	bd766ab9d16550c63502089e9be972e397275fb30e30f60f9f20c3a2393c6aabe36c35a0bebc5853837afa55ffcf47f0a0e88d9c222338e71a2638301ffa34ef	cmq118wjr006rcuonhrh7mqpj	2026-06-14 10:38:04.851	2026-06-07 10:38:04.853
cmq4zsclo0001yb4ymxds4pnw	c7fa06f9c91816cc6959394f579b4021b9a3503ad7cf23c90aaf8e08932849eeb7f1bc40897edb706402efa0cd7fa67eb9f3f4239507733310f1ea3659a324c0	cmq118y1o006vcuonry5z7sgx	2026-06-15 09:12:04.806	2026-06-08 09:12:04.809
cmq4zsfqk0003yb4yxctoqh4k	70aa47b3fe48cfaf4d8fc7aec8e23b89ba7ee39875faef97593a803e1d30596ec3c007fcb2c895f3c8c58432daaeb269e1161f92d3362a6db606e72e1b935fc6	cmq118ysb006xcuon40u695ve	2026-06-15 09:12:08.874	2026-06-08 09:12:08.876
cmq4zv74x0005yb4yj8exswb8	b4da6c593d4e3f142854f9a7f189caf50e47ed64da6bf0774baefdcac04410ae440b9f908221ecb4c365abb874a44f37a1b07c02f8d1679a238811c6e8cc17ad	cmq118ysb006xcuon40u695ve	2026-06-15 09:14:17.696	2026-06-08 09:14:17.698
cmq4zvb370007yb4yye3dq6l0	7f1d0c812c3d09ad93363728a4d971328743cf703272a84a15fa654dfd59def5a4577ca8ff0d30e8deb1c2c4ad3a37ee27129c661761eac81deb9a093ce644f8	cmq118y1o006vcuonry5z7sgx	2026-06-15 09:14:22.817	2026-06-08 09:14:22.819
cmq4zvrgd0009yb4ylxdvxwtd	97c9f948bb87cb3b37f6b61e9510dc9fc52f71f753137444266febdd2d94897beca0cba7dd653b841855c5af0ed2974c103bb69a2eb7f346135951f91a533ee2	cmq118ysb006xcuon40u695ve	2026-06-15 09:14:44.028	2026-06-08 09:14:44.03
cmq4zwbcj000hyb4yklfu2yny	886a0a7dfe222983807913f2a2a72df2350304e2b5ea6e06380570b2d78b89ad4fc753ad9e2e00c626f06934316638f7bbf32f9bb88f1c202bcdf797d6280ce5	cmq118ysb006xcuon40u695ve	2026-06-15 09:15:09.808	2026-06-08 09:15:09.811
cmq4zx089000nyb4yx1iyrrc3	ae37763d80a5135fff9193e25b6d24abccc291169652f46642ac73bb7f58ad65a9512c80ad7c5c934781523f62b04c8f632d50f5e1ef76e7cb4e4db2986fef8b	cmq118wjr006rcuonhrh7mqpj	2026-06-15 09:15:42.056	2026-06-08 09:15:42.058
cmq4zx17v000pyb4y0mxm3uva	77222c475b439e912c011a87ec08750cc546dd87f46278ac326bf97e94fa303d6b0183d1ad25f18ee61d268a300e79100ee140d4e28eb3815be28f4fc2bd3ff4	cmq118x8z006tcuon8i9s62a0	2026-06-15 09:15:43.338	2026-06-08 09:15:43.34
cmq4zxhzn000vyb4y5tysn9vk	d0386ad22b2f8b5ca204f1302f648a0e5237e5a1e68d5c68c2f9de9d1564c8b31d2fa1587f6258632e8de4cb5f1269da48fc6fc3d93bdc6e6d93fc6791f12181	cmq118x8z006tcuon8i9s62a0	2026-06-15 09:16:05.074	2026-06-08 09:16:05.076
cmq4zxjng000xyb4ygz978zb8	8ac37cfdc2f311d4245f568df308765e5dcf8dc9f474fa736cf88e2c235dfba01fd2af793f45a99063c6f93708cbe262bb5be7e44f37e53054b70f58df75056c	cmq118wjr006rcuonhrh7mqpj	2026-06-15 09:16:07.226	2026-06-08 09:16:07.228
cmq4zxvy5000zyb4ys5jdgmhw	b84e6959f98d050ccf1f87df166fea332d5d4d356b856249196ce8354d680b0369a7ed9c6438c9441cf61dcc9f4c503719d58c42bad40a0f49ca3dd890303aee	cmq118x8z006tcuon8i9s62a0	2026-06-15 09:16:23.163	2026-06-08 09:16:23.165
cmq4zxyqm0011yb4y1kl6jb67	756a92a6c548a259698ff72e5017318fce5c67c728675736ca6025ee0d801d680a5ad2ea75e833ee7382bc71ac4053c775831f2d2c2b30c5edb9418736d763eb	cmq118wjr006rcuonhrh7mqpj	2026-06-15 09:16:26.78	2026-06-08 09:16:26.782
cmq4zymx70013yb4yjq2vrjb2	e0f39af3cbeaa03c45d885ba153d93b21c9d6c801cdcb53942010d2e77cdc7cc93c4a39449adc69dd50bdb31aec4290e746e50ab79140c44347ac5fddae22e91	cmq118wjr006rcuonhrh7mqpj	2026-06-15 09:16:58.121	2026-06-08 09:16:58.124
cmq9cqrdf000xfx7li9otwf1o	ae0d30f74b4cf4e514fa60883043333cf792081ab92c0c57960f30575acad0ba39f7d0af8ff6eba864a91a3acee1b228cb27aaa777a4465a28eed9db5378976f	cmq118vvn006pcuonlwldds1o	2026-06-18 10:25:50.354	2026-06-11 10:25:50.355
cmq9cv2ga000zfx7lkz9paj1x	1d9df3934b0f43923f944d604b8701f45a473ec3a0c446eeee4394afdae6e0b89c24fbadd7bb3271395d8ff87c418ee658bc8aa5786bb86ed70c2db0c8066023	cmq118y1o006vcuonry5z7sgx	2026-06-18 10:29:11.336	2026-06-11 10:29:11.338
cmq733w9v0018k8yde0jkvz9q	7249d9e963e78f2c79c034f52f282070b0dd446f8182f39ad50cfa46552d998207c6f8871e2f71f325ff19d224e3bf1bca3f5e4e45e9ce142aba3ba67a05c3b7	cmq118wjr006rcuonhrh7mqpj	2026-06-16 20:20:34.716	2026-06-09 20:20:34.721
cmq73q34y0001z1m1i063jt0y	0594299efa9680d5b11a20a21cbff500a14a8f9a8aee74095b42f4e9e89c4ad024ae0e1f5d63b80090c3c68ab6bef4cf969ed9adc0ca9adb23170dd9f2599ded	cmq118wjr006rcuonhrh7mqpj	2026-06-16 20:37:50.039	2026-06-09 20:37:50.047
cmq7539nn0003z1m1c9jm8duc	06aa3729e52c75ed68cf2b871ec0b0cc24d63b838b6ad70ee3c8dc57dc6f4da774e70cd8fc914cc30d1de7e1531f1723970bcb1786a66be2ca4f73003e1fe280	cmq118vvn006pcuonlwldds1o	2026-06-16 21:16:04.632	2026-06-09 21:16:04.637
cmq75h2zf0005z1m1t4405z7g	0f27918321ab48c59c604a03698dbf2b1e71943ac38bf91ab0d8b1245c6ec547259c421f7f779c62b81de796f13a91f2df6c53a2ed82b7bbac32e68d1b15a917	cmq118wjr006rcuonhrh7mqpj	2026-06-16 21:26:49.174	2026-06-09 21:26:49.179
cmq75ru6n0008z1m11v07ka93	1c503b63da1950cdaf2560ad8a7ecb8669c520906ff33eaa093de5f6c7b94ded2e359faa857cab50c8084cb5431073f2c5908ab79912fe043b48fc987ccbf431	cmq118y1o006vcuonry5z7sgx	2026-06-16 21:35:10.989	2026-06-09 21:35:10.992
cmq75zy3c000az1m1hdxugixl	4c981bf87af3e29bc327e29ea93aeb3375eee381dedef9d7914912c9ada4815eb6f863c2928df4e30d4f8df8ff93dabad286a4e9da3bba25bb2d9eac02a436aa	cmq118ysb006xcuon40u695ve	2026-06-16 21:41:29.303	2026-06-09 21:41:29.305
cmq764fmm000cz1m1xwkmrm75	5f3188d26c5bac24c49e90a26ad5f50ae6598d8bddaa7aa75d039a3e8372895452994d8e6611b9632fb0a29c5bd4d7e4ce867fe9c8254c6ec3720a5599c66384	cmq118ysb006xcuon40u695ve	2026-06-16 21:44:58.652	2026-06-09 21:44:58.654
cmq76ax48000ez1m15wwun04x	d65b3b34bc0bb7e1724869566ad685df63e781da2ee593491c835f1cbcc0debbb3c1d1ec83cd425bc9b368143e42b87a4ef1bd5d1d0948f1239ede021bea4d65	cmq118y1o006vcuonry5z7sgx	2026-06-16 21:50:01.255	2026-06-09 21:50:01.256
cmq76cdwn000gz1m11zk4hu6f	b87cb2f6e38f67e77303fa4c558805381c2c478562cad33cda5ca074c52769dec39d700f9769c214a781fb6c4668ce5d7dea068df7b704353b6942c7f6a8ff37	cmq118ysb006xcuon40u695ve	2026-06-16 21:51:09.67	2026-06-09 21:51:09.671
cmq76cx06000iz1m1b233xhm9	cf747d152a2bd3e39c7210ee3535b3e96396492e8d1d5e70e47663fa3df6c6d19f709c3293bd8570b36de14906810e2d30b11fb262afc4d430afd130d6224feb	cmq118ysb006xcuon40u695ve	2026-06-16 21:51:34.42	2026-06-09 21:51:34.423
cmq76lc7i000kz1m1bnnxn5s1	5fe2c5af3a9a5d8043b89ca28ecd1a537bd37612000a265094c89e53ed3048a0fc3068ca3f1aa1f1a91913cae374f50b1a42a5b5ad6bf73b1b42b1af7729657b	cmq118x8z006tcuon8i9s62a0	2026-06-16 21:58:07.373	2026-06-09 21:58:07.375
cmq76pl2x000mz1m1o909k6y5	2ff3441af93910b6097b8f7ca8f038795ffb957358d79209a942119d6ce7b37d654855243fe3119e5d26397e8f74f1f6e509cca704770e68059a7eb2260a7ce4	cmq118wjr006rcuonhrh7mqpj	2026-06-16 22:01:25.496	2026-06-09 22:01:25.497
cmq76sis2000oz1m1myqjlioa	a518afe7ffc78e23ca85ccde38043d71500e23a3bb54d3111a5e443418f7dec6cfd65a88f41ba9028e8c82fb4f649dd60660a75354ff201e251e7ca231025933	cmq118vvn006pcuonlwldds1o	2026-06-16 22:03:42.481	2026-06-09 22:03:42.483
cmq76t52a000qz1m16e6yzbf9	62d1777015c3e28b5a94b57839d7d578c9199cc0e569175e362d1f02f0a812bf0d5aa2ba7d428a71911bdb356f26fab5b8b4d39c42594845b741c6352d992d6c	cmq118wjr006rcuonhrh7mqpj	2026-06-16 22:04:11.361	2026-06-09 22:04:11.363
cmq7779u7000sz1m16kgqa2sz	b2854447946e2a03b5be09a7fcfd0e4a5ede2df029bbdeb70155e49ac39ea96c3988fc9d6ce4bf44e11f79ef7823d7cafed1b9f1e12d3e56079536c809fcba5c	cmq118wjr006rcuonhrh7mqpj	2026-06-16 22:15:10.734	2026-06-09 22:15:10.736
cmq77fl3r000uz1m1t1sz5dbw	b7e419d541ea7cbb718ff074c2f118472286ddcc051ccbb4cd52cbca3035fa6d54036a6c7d1833681801a7594d6e9d555cd2b2afc8e67e7c167feb18400614dc	cmq118wjr006rcuonhrh7mqpj	2026-06-16 22:21:38.582	2026-06-09 22:21:38.583
cmq77fqnb000wz1m12csl8bza	5790833109897175576fe4d97a25eb3a2b269695d40ef36b20e4e8adea25957498de5366e3ef54923223000d40cc8f2025df1d4bdd2d8d1464e41b58603f20d5	cmq118wjr006rcuonhrh7mqpj	2026-06-16 22:21:45.766	2026-06-09 22:21:45.767
cmq78ns2c000yz1m1pvpz6dzv	36979232e44cd1d2808cefd271122fe5700fc823f2df4a5e6e52fb31a5773b559ddf76cd169b6fef23b497c9a8853b6c4440f36891aec9e7f6144f3be75d15fa	cmq118wjr006rcuonhrh7mqpj	2026-06-16 22:56:00.466	2026-06-09 22:56:00.469
cmq78oqaq0010z1m1mws8wyuu	c7301cd4dfa11831c2add65f0d162e2ec719899b04fbdf2cc6863ff5c80543f7744fa0f080993e4d2e6b80bb5652d41af42abcf79a0c59ebdf4ac994f4c5ef1b	cmq118wjr006rcuonhrh7mqpj	2026-06-16 22:56:44.833	2026-06-09 22:56:44.834
cmq78q7pl0012z1m1mmm58oxf	a72ab592369b29d86c66156b1a777eded307b674d882ab2aacb986ca6c834ada6da13527b187c71a8483a6005c94e5655df2a877984626ac9fc0cfb695c306ca	cmq118wjr006rcuonhrh7mqpj	2026-06-16 22:57:54.055	2026-06-09 22:57:54.057
cmq78swzm0014z1m1covemyje	b94a594d1ff2df0d580699e13e74707e8ee0015745879d8e6d96bd16e4ba62ccddf6cf5beb1d5f1e631fc226481a2a24d9207415842d686ba4d4ef4f97d89228	cmq118ysb006xcuon40u695ve	2026-06-16 23:00:00.128	2026-06-09 23:00:00.13
cmq78uayx0016z1m1aez3xo5s	d108fb4f5429e99c4097c511f1c7b7c707b521b5e4eb409b842722e3a9e14299fc638f8f862b5a8439836bb4f4f454faf7ab271752a5507d72824f6d48709aa5	cmq118y1o006vcuonry5z7sgx	2026-06-16 23:01:04.904	2026-06-09 23:01:04.905
cmq78vrxn0018z1m16jykgrn0	fe547b823174497eb8778074a1b4d52cd9df0f2ab49c8f56c580fa92d0f9021f654048efc25dea1ab4b433651ab7d31734d27391ef92ffa6a02b068f828b0355	cmq118x8z006tcuon8i9s62a0	2026-06-16 23:02:13.546	2026-06-09 23:02:13.548
cmq78xsi4001az1m1d89kebpu	6e04f8e3bd5dcfd99a40e7dc7f77e41a8514b11f253f49df1f93088659bfecb2efc427d72b120f5f17af279f838375c98d3a2714a5f1f5d46232fdca7c21658d	cmq118vvn006pcuonlwldds1o	2026-06-16 23:03:47.594	2026-06-09 23:03:47.596
cmq798rd2001cz1m12b26lgv5	ad73c51d4ef1c40cc61ab73474093f6297e659a6d35e398d52a49fb03261d822d99634ec718e90aa689106136d54823c921a1412b8b28f4b57f2ac663212550d	cmq118ysb006xcuon40u695ve	2026-06-16 23:12:19.333	2026-06-09 23:12:19.334
cmq79c34q001ez1m1jjl2642l	5e263cf976cc671ca9c1f325e27dbd9bdf9ee006de04d0eaa1d55688293dd1877d2bbf48989377b964712611f8eb0336cafb932009a49fa08955cfe64831f019	cmq118x8z006tcuon8i9s62a0	2026-06-16 23:14:54.553	2026-06-09 23:14:54.554
cmq79iyix001hz1m12s645lc5	5546a464e2e71ca0c6e16a65f929661cfcbcebe69bd71e7ed4652b1873ca1878120b50eb7c26829ca84b2ac6042d8a301801e2f724d12bcdbe0f410b5abaee08	cmq118y1o006vcuonry5z7sgx	2026-06-16 23:20:15.176	2026-06-09 23:20:15.178
cmq79rzna001jz1m1fi6e37ud	dbab0ade38d154f64b52fffaf9d952f1e9519660617c663ab6f0592798d68130f38e9dcbfcfc83cdd4e0bf69b30ff2a0a9598d3a043982f3e98384d62b2f4875	cmq118x8z006tcuon8i9s62a0	2026-06-16 23:27:16.533	2026-06-09 23:27:16.534
cmq79vdgx001lz1m1u42ihdt5	767396013c05f740970bdefd89f54b087460c36fcd004da98d9193737e87a223de813ee8db5ca83467f7067ce8848e3b6b36a0ecbfb6876bd294112c4d0ee5df	cmq118wjr006rcuonhrh7mqpj	2026-06-16 23:29:54.416	2026-06-09 23:29:54.417
cmq9cdnyp000tfx7llhzwtabw	833e2948f50abf0e46ead15edeecf12e98d6b16e7753c29a48aff2043615536d77aa877edc89b870ae54a0230d1beba845b8feec7f6369b1b86b41e10b2f1ead	cmq9cdnxv000rfx7lipos2bx3	2026-06-18 10:15:39.403	2026-06-11 10:15:39.408
cmq9czcam0011fx7lw7ai4tdq	bb8a9bec85e00295994a0003df0ee95d9c8b4a0ba1316646d3999e38efb1e41dcaa14fa67109b956e8046f9a845b63e17262ab7c35d2b7ab25de76edc6191a05	cmq118ysb006xcuon40u695ve	2026-06-18 10:32:30.717	2026-06-11 10:32:30.718
cmq9d2g7a0013fx7l6tm2zbt5	e1b867ba0d21874cf8badb62e79349c20c48841d968d6904c01e8bc872a592bd1fcefef82aca9b719aff4dc19d582395a5fab5b480a938a978058f7975ee61c7	cmq118x8z006tcuon8i9s62a0	2026-06-18 10:34:55.748	2026-06-11 10:34:55.75
cmq7r1ctc003oz1m1qfblbyxc	78ceefee7e084b5d16445843ed6ca588b16a4f6da8d57ba7e13818573445da48639698093ace3b03d2e858433f6cee15c3fe93c5015b7383d7babcfd3caf4f7a	cmq118x8z006tcuon8i9s62a0	2026-06-17 07:30:26.975	2026-06-10 07:30:26.977
cmq80knxx003qz1m1e2hg9tf4	153023f2f3ed782f8973eb278062c6900269a56121aae5681a4afc4428688d92e046fa29df267f65ff78dc9cadb0c9240af94b91f76ae0026f32c9cc2fbac183	cmq118x8z006tcuon8i9s62a0	2026-06-17 11:57:24.393	2026-06-10 11:57:24.4
cmq82xyzk00017z5hq31qh9rw	eb7881e086d4b7041841994209f379e296bef7343ebb6c9ebc167a26df2dd96e730a144f5f11bf16b7187d4882f944f7df07e3254b48741130e4d2088a1eb458	cmq118x8z006tcuon8i9s62a0	2026-06-17 13:03:44.475	2026-06-10 13:03:44.478
\.


--
-- Data for Name: Reservation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Reservation" (id, "customerId", "branchId", "tableId", "reservationDate", "partySize", status, "createdAt") FROM stdin;
cmq324bis00bv12paouk17r7k	cmq118vvn006pcuonlwldds1o	cmq118upo0000cuonozp6ur0p	cmq323shp000812paenlpj8el	2026-06-09 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.165
cmq324bj100c112pawhf70xls	cmq118vvn006pcuonlwldds1o	cmq118upo0000cuonozp6ur0p	cmq323shy000e12patab97mc8	2026-06-12 17:00:00	2	CONFIRMED	2026-06-07 00:41:50.174
cmq324bja00c312pale1yp4u4	cmq118vvn006pcuonlwldds1o	cmq118upo0000cuonozp6ur0p	cmq323shj000612pa9b08ds6c	2026-06-13 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.182
cmq324bjh00c512paenjb4loz	cmq118vvn006pcuonlwldds1o	cmq118upo0000cuonozp6ur0p	cmq323shp000812paenlpj8el	2026-06-14 17:00:00	4	CONFIRMED	2026-06-07 00:41:50.189
cmq324bjk00c712pavn69nca6	cmq118vvn006pcuonlwldds1o	cmq118upo0000cuonozp6ur0p	cmq323shs000a12pa6xd7z6st	2026-06-15 17:00:00	5	CONFIRMED	2026-06-07 00:41:50.192
cmq324bjm00c912pagbbsntke	cmq118vvn006pcuonlwldds1o	cmq118upo0000cuonozp6ur0p	cmq323shu000c12paksm16wv0	2026-06-16 17:00:00	2	CONFIRMED	2026-06-07 00:41:50.195
cmq324bjp00cb12pax4ensq05	cmq118vvn006pcuonlwldds1o	cmq118upo0000cuonozp6ur0p	cmq323shy000e12patab97mc8	2026-06-17 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.197
cmq324bng00e712pazxttuuzg	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq323skk002g12paugh20qoc	2026-06-09 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.332
cmq324bnj00e912pa9qwq55im	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq323skl002i12paz8tibku1	2026-06-10 17:00:00	4	CONFIRMED	2026-06-07 00:41:50.335
cmq324bnl00eb12payo113cgc	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq323skn002k12patkkzwk68	2026-06-11 17:00:00	5	CONFIRMED	2026-06-07 00:41:50.337
cmq324bno00ed12pak8rllmkz	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq323skq002m12pagnb77z4n	2026-06-12 17:00:00	2	CONFIRMED	2026-06-07 00:41:50.34
cmq324bnr00ef12paayay5epw	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq323ski002e12pa34q5vc55	2026-06-13 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.344
cmq324bnu00eh12paywjw34ox	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq323skk002g12paugh20qoc	2026-06-14 17:00:00	4	CONFIRMED	2026-06-07 00:41:50.347
cmq324bnx00ej12pam8c1e0k3	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq323skl002i12paz8tibku1	2026-06-15 17:00:00	5	CONFIRMED	2026-06-07 00:41:50.349
cmq324bnz00el12pawz5km5mw	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq323skn002k12patkkzwk68	2026-06-16 17:00:00	2	CONFIRMED	2026-06-07 00:41:50.352
cmq324bo200en12pa4hjmv53y	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq323skq002m12pagnb77z4n	2026-06-17 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.354
cmq324bs600gj12pacyuwoyu4	cmq118vvn006pcuonlwldds1o	cmq118uq60002cuonb0b9udoy	cmq323sme004412pa9z3kagth	2026-06-09 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.503
cmq324bsa00gl12pa44y2678g	cmq118vvn006pcuonlwldds1o	cmq118uq60002cuonb0b9udoy	cmq323smg004612paweg8cde7	2026-06-10 17:00:00	4	CONFIRMED	2026-06-07 00:41:50.506
cmq324bsd00gn12pajep1nh4t	cmq118vvn006pcuonlwldds1o	cmq118uq60002cuonb0b9udoy	cmq323smi004812pauvyy8acu	2026-06-11 17:00:00	5	CONFIRMED	2026-06-07 00:41:50.509
cmq324bsj00gp12pa4lrupvjx	cmq118vvn006pcuonlwldds1o	cmq118uq60002cuonb0b9udoy	cmq323sml004a12paqrb2ue73	2026-06-12 17:00:00	2	CONFIRMED	2026-06-07 00:41:50.515
cmq324bsm00gr12pa2qcmiz41	cmq118vvn006pcuonlwldds1o	cmq118uq60002cuonb0b9udoy	cmq323smc004212pa787okyjw	2026-06-13 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.518
cmq324bsr00gt12paf1290z96	cmq118vvn006pcuonlwldds1o	cmq118uq60002cuonb0b9udoy	cmq323sme004412pa9z3kagth	2026-06-14 17:00:00	4	CONFIRMED	2026-06-07 00:41:50.523
cmq324bsv00gv12pasch07u40	cmq118vvn006pcuonlwldds1o	cmq118uq60002cuonb0b9udoy	cmq323smg004612paweg8cde7	2026-06-15 17:00:00	5	CONFIRMED	2026-06-07 00:41:50.527
cmq324bt000gx12paxu8xomco	cmq118vvn006pcuonlwldds1o	cmq118uq60002cuonb0b9udoy	cmq323smi004812pauvyy8acu	2026-06-16 17:00:00	2	CONFIRMED	2026-06-07 00:41:50.532
cmq324bt700gz12patnbfj8j7	cmq118vvn006pcuonlwldds1o	cmq118uq60002cuonb0b9udoy	cmq323sml004a12paqrb2ue73	2026-06-17 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.54
cmq324by600iv12padw9ev7nj	cmq118vvn006pcuonlwldds1o	cmq118uq90003cuonl9nim67p	cmq323so2005i12pazl1bmz4w	2026-06-09 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.718
cmq324by800ix12pa5jba619s	cmq118vvn006pcuonlwldds1o	cmq118uq90003cuonl9nim67p	cmq323so5005k12pagqvxbsz0	2026-06-10 17:00:00	4	CONFIRMED	2026-06-07 00:41:50.72
cmq324bya00iz12pa98bf239c	cmq118vvn006pcuonlwldds1o	cmq118uq90003cuonl9nim67p	cmq323so7005m12pa0ga34yu4	2026-06-11 17:00:00	5	CONFIRMED	2026-06-07 00:41:50.723
cmq324bye00j112payhf0uv0l	cmq118vvn006pcuonlwldds1o	cmq118uq90003cuonl9nim67p	cmq323soa005o12pavlkfixf2	2026-06-12 17:00:00	2	CONFIRMED	2026-06-07 00:41:50.727
cmq324byi00j312pawqwg2ipn	cmq118vvn006pcuonlwldds1o	cmq118uq90003cuonl9nim67p	cmq323snz005g12paz7bi3puv	2026-06-13 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.73
cmq324byp00j512padixf2pgp	cmq118vvn006pcuonlwldds1o	cmq118uq90003cuonl9nim67p	cmq323so2005i12pazl1bmz4w	2026-06-14 17:00:00	4	CONFIRMED	2026-06-07 00:41:50.737
cmq324bys00j712pa7x8257p5	cmq118vvn006pcuonlwldds1o	cmq118uq90003cuonl9nim67p	cmq323so5005k12pagqvxbsz0	2026-06-15 17:00:00	5	CONFIRMED	2026-06-07 00:41:50.74
cmq324byz00j912pa8l0g1c4a	cmq118vvn006pcuonlwldds1o	cmq118uq90003cuonl9nim67p	cmq323so7005m12pa0ga34yu4	2026-06-16 17:00:00	2	CONFIRMED	2026-06-07 00:41:50.747
cmq324bz200jb12pa7zwlcbpw	cmq118vvn006pcuonlwldds1o	cmq118uq90003cuonl9nim67p	cmq323soa005o12pavlkfixf2	2026-06-17 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.75
cmq324c3b00l712pa5oa5jrif	cmq118vvn006pcuonlwldds1o	cmq118uqc0004cuonac33ndz8	cmq323spt006w12pajr920sqs	2026-06-09 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.903
cmq324c3d00l912pan93s1ig8	cmq118vvn006pcuonlwldds1o	cmq118uqc0004cuonac33ndz8	cmq323spv006y12pauj26o08g	2026-06-10 17:00:00	4	CONFIRMED	2026-06-07 00:41:50.905
cmq324c3h00lb12pa4gb17l1n	cmq118vvn006pcuonlwldds1o	cmq118uqc0004cuonac33ndz8	cmq323spx007012paoek6k61t	2026-06-11 17:00:00	5	CONFIRMED	2026-06-07 00:41:50.909
cmq324c3m00ld12pa3v9imj4q	cmq118vvn006pcuonlwldds1o	cmq118uqc0004cuonac33ndz8	cmq323spz007212padjc6poyd	2026-06-12 17:00:00	2	CONFIRMED	2026-06-07 00:41:50.914
cmq324c3p00lf12pabxip4aco	cmq118vvn006pcuonlwldds1o	cmq118uqc0004cuonac33ndz8	cmq323spq006u12pa8d42rjem	2026-06-13 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.918
cmq324c3s00lh12pa349yjko6	cmq118vvn006pcuonlwldds1o	cmq118uqc0004cuonac33ndz8	cmq323spt006w12pajr920sqs	2026-06-14 17:00:00	4	CONFIRMED	2026-06-07 00:41:50.92
cmq324c3u00lj12pamj6bhwi7	cmq118vvn006pcuonlwldds1o	cmq118uqc0004cuonac33ndz8	cmq323spv006y12pauj26o08g	2026-06-15 17:00:00	5	CONFIRMED	2026-06-07 00:41:50.922
cmq324c3z00ll12papw0qzq99	cmq118vvn006pcuonlwldds1o	cmq118uqc0004cuonac33ndz8	cmq323spx007012paoek6k61t	2026-06-16 17:00:00	2	CONFIRMED	2026-06-07 00:41:50.927
cmq324c4100ln12pagsb1fwo7	cmq118vvn006pcuonlwldds1o	cmq118uqc0004cuonac33ndz8	cmq323spz007212padjc6poyd	2026-06-17 17:00:00	3	CONFIRMED	2026-06-07 00:41:50.93
cmq3sdgo4000igxgopo03ik2x	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq118uup0020cuonsq38ddrh	2026-06-13 11:30:00	2	PENDING	2026-06-07 12:56:46.755
cmq324bnb00e512paw0h5c0xx	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq323ski002e12pa34q5vc55	2026-06-08 17:00:00	2	CANCELLED	2026-06-07 00:41:50.327
cmq324by300it12pazf97uiad	cmq118vvn006pcuonlwldds1o	cmq118uq90003cuonl9nim67p	cmq323snz005g12paz7bi3puv	2026-06-08 17:00:00	2	CANCELLED	2026-06-07 00:41:50.715
cmq324c3600l512pa8fkwr484	cmq118vvn006pcuonlwldds1o	cmq118uqc0004cuonac33ndz8	cmq323spq006u12pa8d42rjem	2026-06-08 17:00:00	2	SEATED	2026-06-07 00:41:50.898
cmq49izyc0003vmsjea1jmfff	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq118uuy0028cuonigrja4bw	2026-06-08 18:00:00	4	SEATED	2026-06-07 20:56:58.489
cmq324bs400gh12pa5t4cnpq4	cmq118vvn006pcuonlwldds1o	cmq118uq60002cuonb0b9udoy	cmq323smc004212pa787okyjw	2026-06-08 17:00:00	2	CANCELLED	2026-06-07 00:41:50.5
cmq324biz00bz12par5grox35	cmq118vvn006pcuonlwldds1o	cmq118upo0000cuonozp6ur0p	cmq323shu000c12paksm16wv0	2026-06-11 17:00:00	5	SEATED	2026-06-07 00:41:50.171
cmq324biv00bx12pagy3it4i1	cmq118vvn006pcuonlwldds1o	cmq118upo0000cuonozp6ur0p	cmq323shs000a12pa6xd7z6st	2026-06-10 17:00:00	4	COMPLETED	2026-06-07 00:41:50.168
cmq4cxmov000c2y1sgcerr713	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq118uv0002acuonz0h8p5yf	2026-06-08 10:30:00	4	CANCELLED	2026-06-07 22:32:19.998
cmq324bi200bt12paix0jis78	cmq118vvn006pcuonlwldds1o	cmq118upo0000cuonozp6ur0p	cmq323shj000612pa9b08ds6c	2026-06-08 17:00:00	2	CANCELLED	2026-06-07 00:41:50.139
cmq4etq4h00043vhiqfjvvycj	cmq118vvn006pcuonlwldds1o	cmq118uq30001cuonmbe5ypw9	cmq118uv7002gcuon6lhcw95h	2026-06-08 18:00:00	6	SEATED	2026-06-07 23:25:17.053
cmq7aaq27001yz1m1irewit8n	cmq118vvn006pcuonlwldds1o	cmq118upo0000cuonozp6ur0p	cmq118uuj001wcuonuwsksmcn	2026-06-11 18:00:00	6	CONFIRMED	2026-06-09 23:41:50.574
\.


--
-- Data for Name: Table; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Table" (id, "branchId", "tableNumber", capacity, status) FROM stdin;
cmq118uu2001icuonnbwxx2ow	cmq118upo0000cuonozp6ur0p	2	2	AVAILABLE
cmq118uu5001kcuon1x377p60	cmq118upo0000cuonozp6ur0p	3	2	AVAILABLE
cmq118uu8001mcuons5a56px5	cmq118upo0000cuonozp6ur0p	4	2	AVAILABLE
cmq118uuf001scuonb4n7pw5c	cmq118upo0000cuonozp6ur0p	7	4	AVAILABLE
cmq118uur0022cuonclae6vzd	cmq118uq30001cuonmbe5ypw9	2	2	AVAILABLE
cmq118uut0024cuon3mu8ld75	cmq118uq30001cuonmbe5ypw9	3	2	AVAILABLE
cmq118uuw0026cuonloxoz4x4	cmq118uq30001cuonmbe5ypw9	4	2	AVAILABLE
cmq118uvd002kcuonjag5sea0	cmq118uq60002cuonb0b9udoy	1	2	AVAILABLE
cmq118uvf002mcuon4u5bvd5a	cmq118uq60002cuonb0b9udoy	2	2	AVAILABLE
cmq118uvi002ocuonxtq5mjxo	cmq118uq60002cuonb0b9udoy	3	2	AVAILABLE
cmq118uvk002qcuonpz365b3q	cmq118uq60002cuonb0b9udoy	4	2	AVAILABLE
cmq118uvm002scuondmlww2qw	cmq118uq60002cuonb0b9udoy	5	4	AVAILABLE
cmq118uvo002ucuona9lt4xfg	cmq118uq60002cuonb0b9udoy	6	4	AVAILABLE
cmq118uvq002wcuon66ggbfjn	cmq118uq60002cuonb0b9udoy	7	4	AVAILABLE
cmq118uvs002ycuonxuaikgzl	cmq118uq60002cuonb0b9udoy	8	4	AVAILABLE
cmq118uvu0030cuonwma9sy7l	cmq118uq60002cuonb0b9udoy	9	6	AVAILABLE
cmq118uvx0032cuon6ribef1f	cmq118uq60002cuonb0b9udoy	10	6	AVAILABLE
cmq118uw10034cuonviyhpt6s	cmq118uq90003cuonl9nim67p	1	2	AVAILABLE
cmq118uw40036cuonj2deynr3	cmq118uq90003cuonl9nim67p	2	2	AVAILABLE
cmq118uw80038cuonf3q14t5u	cmq118uq90003cuonl9nim67p	3	2	AVAILABLE
cmq118uwb003acuon790h0cg8	cmq118uq90003cuonl9nim67p	4	2	AVAILABLE
cmq118uwe003ccuonrow11ena	cmq118uq90003cuonl9nim67p	5	4	AVAILABLE
cmq118uwh003ecuon6izukitn	cmq118uq90003cuonl9nim67p	6	4	AVAILABLE
cmq118uwj003gcuonjss25hot	cmq118uq90003cuonl9nim67p	7	4	AVAILABLE
cmq118uwl003icuonis56vcgw	cmq118uq90003cuonl9nim67p	8	4	AVAILABLE
cmq118uwo003kcuone2g27swa	cmq118uq90003cuonl9nim67p	9	6	AVAILABLE
cmq118uwr003mcuontirus93f	cmq118uq90003cuonl9nim67p	10	6	AVAILABLE
cmq118uww003ocuonojmwxud2	cmq118uqc0004cuonac33ndz8	1	2	AVAILABLE
cmq118uwy003qcuonl39cy2iq	cmq118uqc0004cuonac33ndz8	2	2	AVAILABLE
cmq118ux0003scuonccpx7xl8	cmq118uqc0004cuonac33ndz8	3	2	AVAILABLE
cmq118ux2003ucuon7k8mxzeq	cmq118uqc0004cuonac33ndz8	4	2	AVAILABLE
cmq118ux4003wcuonrms6a01i	cmq118uqc0004cuonac33ndz8	5	4	AVAILABLE
cmq118ux7003ycuonczgkc93y	cmq118uqc0004cuonac33ndz8	6	4	AVAILABLE
cmq118ux90040cuonjym8saxy	cmq118uqc0004cuonac33ndz8	7	4	AVAILABLE
cmq118uxb0042cuonh510f7i9	cmq118uqc0004cuonac33ndz8	8	4	AVAILABLE
cmq118uxd0044cuong2r13kzz	cmq118uqc0004cuonac33ndz8	9	6	AVAILABLE
cmq118uxf0046cuon1osuct06	cmq118uqc0004cuonac33ndz8	10	6	AVAILABLE
cmq323shp000812paenlpj8el	cmq118upo0000cuonozp6ur0p	12	2	AVAILABLE
cmq323shy000e12patab97mc8	cmq118upo0000cuonozp6ur0p	15	2	AVAILABLE
cmq323si1000g12pax2pch8mg	cmq118upo0000cuonozp6ur0p	16	4	AVAILABLE
cmq323si4000i12paqdy9lzwx	cmq118upo0000cuonozp6ur0p	17	4	AVAILABLE
cmq323si6000k12pa19kwyakt	cmq118upo0000cuonozp6ur0p	18	4	AVAILABLE
cmq323si8000m12pakg97tt5y	cmq118upo0000cuonozp6ur0p	19	4	AVAILABLE
cmq323sia000o12pakm6ivag6	cmq118upo0000cuonozp6ur0p	20	4	AVAILABLE
cmq323sib000q12pan6jjg5ot	cmq118upo0000cuonozp6ur0p	21	4	AVAILABLE
cmq323sig000s12paj0951qv5	cmq118upo0000cuonozp6ur0p	22	4	AVAILABLE
cmq323sii000u12pag2vceidu	cmq118upo0000cuonozp6ur0p	23	4	AVAILABLE
cmq323sil000w12pa0v68kiah	cmq118upo0000cuonozp6ur0p	24	4	AVAILABLE
cmq323sio000y12pail3c94mo	cmq118upo0000cuonozp6ur0p	25	4	AVAILABLE
cmq323sir001012pa6nvb3ay4	cmq118upo0000cuonozp6ur0p	26	4	AVAILABLE
cmq323siv001212parn6g9enx	cmq118upo0000cuonozp6ur0p	27	4	AVAILABLE
cmq323siy001412pa5kndfsgl	cmq118upo0000cuonozp6ur0p	28	4	AVAILABLE
cmq323sj0001612pa7njhifk1	cmq118upo0000cuonozp6ur0p	29	4	AVAILABLE
cmq323sj2001812pah11smcto	cmq118upo0000cuonozp6ur0p	30	4	AVAILABLE
cmq323sj4001a12pa48ykrxkc	cmq118upo0000cuonozp6ur0p	31	4	AVAILABLE
cmq323sj6001c12pari9gsy8v	cmq118upo0000cuonozp6ur0p	32	4	AVAILABLE
cmq323sj8001e12pa740vu8s0	cmq118upo0000cuonozp6ur0p	33	4	AVAILABLE
cmq323sjc001g12paqcuwzjou	cmq118upo0000cuonozp6ur0p	34	4	AVAILABLE
cmq323sje001i12pay4m89dvi	cmq118upo0000cuonozp6ur0p	35	4	AVAILABLE
cmq323sjg001k12pass69of8d	cmq118upo0000cuonozp6ur0p	36	6	AVAILABLE
cmq323sji001m12pafyq6ox7c	cmq118upo0000cuonozp6ur0p	37	6	AVAILABLE
cmq323sjk001o12pa27958w4g	cmq118upo0000cuonozp6ur0p	38	6	AVAILABLE
cmq323sjm001q12paev5vpfu9	cmq118upo0000cuonozp6ur0p	39	6	AVAILABLE
cmq323sjo001s12paxdsnmbd6	cmq118upo0000cuonozp6ur0p	40	6	AVAILABLE
cmq323sjp001u12pacbnxxfqj	cmq118upo0000cuonozp6ur0p	41	6	AVAILABLE
cmq323sjt001w12paz1h6bdft	cmq118upo0000cuonozp6ur0p	42	6	AVAILABLE
cmq323sjw001y12pamnhr4v3m	cmq118upo0000cuonozp6ur0p	43	6	AVAILABLE
cmq323sjy002012pafxunrlnh	cmq118upo0000cuonozp6ur0p	44	6	AVAILABLE
cmq323sk0002212pat7ffiu4g	cmq118upo0000cuonozp6ur0p	45	6	AVAILABLE
cmq323sk3002412pahecaa28s	cmq118upo0000cuonozp6ur0p	46	6	AVAILABLE
cmq323sk5002612pa95vnxbbx	cmq118upo0000cuonozp6ur0p	47	6	AVAILABLE
cmq323sk7002812pad1tq3tn5	cmq118upo0000cuonozp6ur0p	48	6	AVAILABLE
cmq118uv3002ccuonzc145hqm	cmq118uq30001cuonmbe5ypw9	7	4	AVAILABLE
cmq118uuh001ucuonwbf7k0q8	cmq118upo0000cuonozp6ur0p	8	4	AVAILABLE
cmq323shu000c12paksm16wv0	cmq118upo0000cuonozp6ur0p	14	2	OCCUPIED
cmq118uul001ycuona30w3hdl	cmq118upo0000cuonozp6ur0p	10	6	AVAILABLE
cmq118uv9002icuonspu3jkki	cmq118uq30001cuonmbe5ypw9	10	6	AVAILABLE
cmq118uuy0028cuonigrja4bw	cmq118uq30001cuonmbe5ypw9	5	4	OCCUPIED
cmq118uup0020cuonsq38ddrh	cmq118uq30001cuonmbe5ypw9	1	2	OCCUPIED
cmq118uv0002acuonz0h8p5yf	cmq118uq30001cuonmbe5ypw9	6	4	AVAILABLE
cmq118uuj001wcuonuwsksmcn	cmq118upo0000cuonozp6ur0p	9	6	RESERVED
cmq118utx001gcuonyc893lw2	cmq118upo0000cuonozp6ur0p	1	2	PAYMENT_PENDING
cmq323shj000612pa9b08ds6c	cmq118upo0000cuonozp6ur0p	11	2	AVAILABLE
cmq118uv7002gcuon6lhcw95h	cmq118uq30001cuonmbe5ypw9	9	6	OCCUPIED
cmq118uua001ocuonacw64k87	cmq118upo0000cuonozp6ur0p	5	4	AVAILABLE
cmq118uud001qcuonvtlc483q	cmq118upo0000cuonozp6ur0p	6	4	AVAILABLE
cmq323shs000a12pa6xd7z6st	cmq118upo0000cuonozp6ur0p	13	2	AVAILABLE
cmq323ska002a12pacauh4mme	cmq118upo0000cuonozp6ur0p	49	6	AVAILABLE
cmq323ske002c12pam67njamq	cmq118upo0000cuonozp6ur0p	50	6	AVAILABLE
cmq323skk002g12paugh20qoc	cmq118uq30001cuonmbe5ypw9	12	2	AVAILABLE
cmq323skl002i12paz8tibku1	cmq118uq30001cuonmbe5ypw9	13	4	AVAILABLE
cmq323skn002k12patkkzwk68	cmq118uq30001cuonmbe5ypw9	14	4	AVAILABLE
cmq323skq002m12pagnb77z4n	cmq118uq30001cuonmbe5ypw9	15	4	AVAILABLE
cmq323skt002o12pa659lfxq3	cmq118uq30001cuonmbe5ypw9	16	4	AVAILABLE
cmq323skv002q12pajsz81go0	cmq118uq30001cuonmbe5ypw9	17	4	AVAILABLE
cmq323skx002s12pax31spl2g	cmq118uq30001cuonmbe5ypw9	18	4	AVAILABLE
cmq323sky002u12pazx3w1et7	cmq118uq30001cuonmbe5ypw9	19	4	AVAILABLE
cmq323sl0002w12pafwzvo7xh	cmq118uq30001cuonmbe5ypw9	20	4	AVAILABLE
cmq323sl2002y12pahc045k27	cmq118uq30001cuonmbe5ypw9	21	4	AVAILABLE
cmq323sl4003012pamv8sg3ti	cmq118uq30001cuonmbe5ypw9	22	4	AVAILABLE
cmq323sl8003212pavrjnyjw2	cmq118uq30001cuonmbe5ypw9	23	4	AVAILABLE
cmq323sla003412pa9lpn76tb	cmq118uq30001cuonmbe5ypw9	24	4	AVAILABLE
cmq323sld003612patdqxf146	cmq118uq30001cuonmbe5ypw9	25	4	AVAILABLE
cmq323slf003812paatl11z02	cmq118uq30001cuonmbe5ypw9	26	4	AVAILABLE
cmq323slh003a12pajxzmz1hp	cmq118uq30001cuonmbe5ypw9	27	4	AVAILABLE
cmq323slj003c12pa7fuom1xx	cmq118uq30001cuonmbe5ypw9	28	4	AVAILABLE
cmq323sln003e12paazbjr9lf	cmq118uq30001cuonmbe5ypw9	29	6	AVAILABLE
cmq323slp003g12pamc6iqkd5	cmq118uq30001cuonmbe5ypw9	30	6	AVAILABLE
cmq323slr003i12pa417654mq	cmq118uq30001cuonmbe5ypw9	31	6	AVAILABLE
cmq323slt003k12pa1fklx044	cmq118uq30001cuonmbe5ypw9	32	6	AVAILABLE
cmq323slv003m12pa2emsrs5y	cmq118uq30001cuonmbe5ypw9	33	6	AVAILABLE
cmq323slw003o12paz7uye0sc	cmq118uq30001cuonmbe5ypw9	34	6	AVAILABLE
cmq323sly003q12pav16d55p8	cmq118uq30001cuonmbe5ypw9	35	6	AVAILABLE
cmq323slz003s12pa55nr7ddo	cmq118uq30001cuonmbe5ypw9	36	6	AVAILABLE
cmq323sm2003u12pa75q1fnwe	cmq118uq30001cuonmbe5ypw9	37	6	AVAILABLE
cmq323sm5003w12pamtpi1f7v	cmq118uq30001cuonmbe5ypw9	38	6	AVAILABLE
cmq323sm7003y12pa9g52kf9f	cmq118uq30001cuonmbe5ypw9	39	6	AVAILABLE
cmq323sm9004012pa8xajuljq	cmq118uq30001cuonmbe5ypw9	40	6	AVAILABLE
cmq323sme004412pa9z3kagth	cmq118uq60002cuonb0b9udoy	12	4	AVAILABLE
cmq323smg004612paweg8cde7	cmq118uq60002cuonb0b9udoy	13	4	AVAILABLE
cmq323smi004812pauvyy8acu	cmq118uq60002cuonb0b9udoy	14	4	AVAILABLE
cmq323sml004a12paqrb2ue73	cmq118uq60002cuonb0b9udoy	15	4	AVAILABLE
cmq323smo004c12paif094we6	cmq118uq60002cuonb0b9udoy	16	4	AVAILABLE
cmq323smq004e12pa2u9fvvv2	cmq118uq60002cuonb0b9udoy	17	4	AVAILABLE
cmq323sms004g12pai3bwbfus	cmq118uq60002cuonb0b9udoy	18	4	AVAILABLE
cmq323smv004i12pafej0zpgl	cmq118uq60002cuonb0b9udoy	19	4	AVAILABLE
cmq323smx004k12pad675tw9y	cmq118uq60002cuonb0b9udoy	20	4	AVAILABLE
cmq323sn0004m12pa7xqfje5p	cmq118uq60002cuonb0b9udoy	21	4	AVAILABLE
cmq323sn2004o12pa70nccrxc	cmq118uq60002cuonb0b9udoy	22	4	AVAILABLE
cmq323sn4004q12pa4wenrifa	cmq118uq60002cuonb0b9udoy	23	4	AVAILABLE
cmq323sn6004s12paute3zc7x	cmq118uq60002cuonb0b9udoy	24	4	AVAILABLE
cmq323sn8004u12paiuwub1gy	cmq118uq60002cuonb0b9udoy	25	6	AVAILABLE
cmq323sna004w12paj6207rjy	cmq118uq60002cuonb0b9udoy	26	6	AVAILABLE
cmq323snb004y12pao3vdzt3f	cmq118uq60002cuonb0b9udoy	27	6	AVAILABLE
cmq323snd005012pafq6v6ep5	cmq118uq60002cuonb0b9udoy	28	6	AVAILABLE
cmq323snf005212pah8t25fks	cmq118uq60002cuonb0b9udoy	29	6	AVAILABLE
cmq323sni005412pa85avueh6	cmq118uq60002cuonb0b9udoy	30	6	AVAILABLE
cmq323snk005612pa1ti9srjp	cmq118uq60002cuonb0b9udoy	31	6	AVAILABLE
cmq323snn005812pat4h7mll9	cmq118uq60002cuonb0b9udoy	32	6	AVAILABLE
cmq323snp005a12paskku9ji1	cmq118uq60002cuonb0b9udoy	33	6	AVAILABLE
cmq323snr005c12paoxmowp83	cmq118uq60002cuonb0b9udoy	34	6	AVAILABLE
cmq323snt005e12pa74cendsk	cmq118uq60002cuonb0b9udoy	35	6	AVAILABLE
cmq323so2005i12pazl1bmz4w	cmq118uq90003cuonl9nim67p	12	4	AVAILABLE
cmq323so5005k12pagqvxbsz0	cmq118uq90003cuonl9nim67p	13	4	AVAILABLE
cmq323so7005m12pa0ga34yu4	cmq118uq90003cuonl9nim67p	14	4	AVAILABLE
cmq323soa005o12pavlkfixf2	cmq118uq90003cuonl9nim67p	15	4	AVAILABLE
cmq323sod005q12parf4eyr1n	cmq118uq90003cuonl9nim67p	16	4	AVAILABLE
cmq323soh005s12paakcdgr83	cmq118uq90003cuonl9nim67p	17	4	AVAILABLE
cmq323soj005u12pa3afz004z	cmq118uq90003cuonl9nim67p	18	4	AVAILABLE
cmq323sol005w12padugssn7h	cmq118uq90003cuonl9nim67p	19	4	AVAILABLE
cmq323soo005y12paqcfmmq1m	cmq118uq90003cuonl9nim67p	20	4	AVAILABLE
cmq323soq006012paxq8emch6	cmq118uq90003cuonl9nim67p	21	4	AVAILABLE
cmq323sos006212paol8xr8tm	cmq118uq90003cuonl9nim67p	22	4	AVAILABLE
cmq323sov006412pa9qv7uhae	cmq118uq90003cuonl9nim67p	23	4	AVAILABLE
cmq323soy006612padaxsavvc	cmq118uq90003cuonl9nim67p	24	4	AVAILABLE
cmq323sp0006812paslx04het	cmq118uq90003cuonl9nim67p	25	6	AVAILABLE
cmq323sp1006a12pautuqk3p1	cmq118uq90003cuonl9nim67p	26	6	AVAILABLE
cmq323sp3006c12pa8pyixn03	cmq118uq90003cuonl9nim67p	27	6	AVAILABLE
cmq323sp5006e12pag1c9id2u	cmq118uq90003cuonl9nim67p	28	6	AVAILABLE
cmq323sp7006g12pa188r9ume	cmq118uq90003cuonl9nim67p	29	6	AVAILABLE
cmq323sp9006i12pabrklnlzl	cmq118uq90003cuonl9nim67p	30	6	AVAILABLE
cmq323spd006k12pav9zx0a7a	cmq118uq90003cuonl9nim67p	31	6	AVAILABLE
cmq323spf006m12pa5sxh8a7o	cmq118uq90003cuonl9nim67p	32	6	AVAILABLE
cmq323spi006o12pag2wkl1x2	cmq118uq90003cuonl9nim67p	33	6	AVAILABLE
cmq323spk006q12pasaodngtv	cmq118uq90003cuonl9nim67p	34	6	AVAILABLE
cmq323spm006s12palg1cy8y2	cmq118uq90003cuonl9nim67p	35	6	AVAILABLE
cmq323spt006w12pajr920sqs	cmq118uqc0004cuonac33ndz8	12	4	AVAILABLE
cmq323spv006y12pauj26o08g	cmq118uqc0004cuonac33ndz8	13	4	AVAILABLE
cmq323spx007012paoek6k61t	cmq118uqc0004cuonac33ndz8	14	4	AVAILABLE
cmq323spz007212padjc6poyd	cmq118uqc0004cuonac33ndz8	15	4	AVAILABLE
cmq323sq1007412paoqk60gcr	cmq118uqc0004cuonac33ndz8	16	4	AVAILABLE
cmq323snz005g12paz7bi3puv	cmq118uq90003cuonl9nim67p	11	4	AVAILABLE
cmq323spq006u12pa8d42rjem	cmq118uqc0004cuonac33ndz8	11	4	OCCUPIED
cmq323smc004212pa787okyjw	cmq118uq60002cuonb0b9udoy	11	4	AVAILABLE
cmq323sq2007612pa963bz22x	cmq118uqc0004cuonac33ndz8	17	4	AVAILABLE
cmq323sq4007812pa39t0e8d6	cmq118uqc0004cuonac33ndz8	18	4	AVAILABLE
cmq323sq6007a12pa8vakfxjx	cmq118uqc0004cuonac33ndz8	19	4	AVAILABLE
cmq323sqa007c12paqy5gxtvz	cmq118uqc0004cuonac33ndz8	20	4	AVAILABLE
cmq323sqc007e12pall4l632m	cmq118uqc0004cuonac33ndz8	21	4	AVAILABLE
cmq323sqe007g12pa0f8rsas0	cmq118uqc0004cuonac33ndz8	22	6	AVAILABLE
cmq323sqg007i12panni5t327	cmq118uqc0004cuonac33ndz8	23	6	AVAILABLE
cmq323sqi007k12pauyzqrcr5	cmq118uqc0004cuonac33ndz8	24	6	AVAILABLE
cmq323sqk007m12pal6kbjybi	cmq118uqc0004cuonac33ndz8	25	6	AVAILABLE
cmq323sql007o12paabr8j2ig	cmq118uqc0004cuonac33ndz8	26	6	AVAILABLE
cmq323sqp007q12patzussbkn	cmq118uqc0004cuonac33ndz8	27	6	AVAILABLE
cmq323sqs007s12pay9f9rbyu	cmq118uqc0004cuonac33ndz8	28	6	AVAILABLE
cmq323sqv007u12pavcimssa4	cmq118uqc0004cuonac33ndz8	29	6	AVAILABLE
cmq323sqy007w12pas0gm9e7c	cmq118uqc0004cuonac33ndz8	30	6	AVAILABLE
cmq118uv5002ecuoneoh4rbur	cmq118uq30001cuonmbe5ypw9	8	4	AVAILABLE
cmq323ski002e12pa34q5vc55	cmq118uq30001cuonmbe5ypw9	11	2	AVAILABLE
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, "firstName", "lastName", email, password, role, "branchId", "employeeId", salary, shift, "employeeStatus", "dateJoined", "teamAssignment", "createdAt") FROM stdin;
cmq118y1o006vcuonry5z7sgx	James	Mitchell	manager.london@steakz.co.uk	$2a$12$hP0VxOzlO20U6Ai8h2mUpOzP51H1SaBO0WOrPD0gaj7rgk2efEQ2m	BRANCH_MANAGER	cmq118upo0000cuonozp6ur0p	STZ-BRM-LON-001	38000.00	FLEXIBLE	ACTIVE	2021-09-01 00:00:00	Management	2026-06-05 14:41:54.011
cmq118ysb006xcuon40u695ve	Sophie	Clarke	waiter.london@steakz.co.uk	$2a$12$W9rR/nKU3GnPGoF130BwteBzHUtmD.KcDocs55k4j.KdHsiAQ70JC	WAITER_CASHIER	cmq118upo0000cuonozp6ur0p	STZ-WTC-LON-001	24000.00	MORNING	ACTIVE	2022-01-10 00:00:00	Floor Team	2026-06-05 14:41:54.972
cmq118zjl006zcuongyo8moj0	Daniel	Hughes	waiter.london2@steakz.co.uk	$2a$12$M6cZBeCPOcPGhLhbJzZbEeMUi8ItQyQ6ukdJckFAuTUNbh0/K1DVO	WAITER_CASHIER	cmq118upo0000cuonozp6ur0p	STZ-WTC-LON-002	23500.00	AFTERNOON	ACTIVE	2022-06-15 00:00:00	Floor Team	2026-06-05 14:41:55.953
cmq1190do0071cuonhxlmvbeo	Marco	Bianchi	chef.london@steakz.co.uk	$2a$12$JHIMUGMVMJLrlv5ootOvmu3y9FUp470pGfckydoYf12TZV0VYuZpW	CHEF	cmq118upo0000cuonozp6ur0p	STZ-CHF-LON-001	32000.00	MORNING	ACTIVE	2021-09-15 00:00:00	Kitchen Team	2026-06-05 14:41:57.036
cmq1191tt0075cuonf80qee5m	Rachel	Thompson	manager.manchester@steakz.co.uk	$2a$12$J7uk5PhxKqm2UIfXHEjAIeO86W.GzVcuNfpapi0R/U2s2ndeYuR76	BRANCH_MANAGER	cmq118uq30001cuonmbe5ypw9	STZ-BRM-MCR-001	38000.00	FLEXIBLE	ACTIVE	2021-10-01 00:00:00	Management	2026-06-05 14:41:58.913
cmq1192k90077cuoni2akrh82	Liam	Walker	waiter.manchester@steakz.co.uk	$2a$12$YX2eZCW/w63WXI81IVUvl.WLrT3x7TYiigh.9OkkKfyZTPjUhGxMC	WAITER_CASHIER	cmq118uq30001cuonmbe5ypw9	STZ-WTC-MCR-001	24000.00	MORNING	ACTIVE	2022-02-01 00:00:00	Floor Team	2026-06-05 14:41:59.865
cmq11938c0079cuon1a2im4w6	Emma	Davies	waiter.manchester2@steakz.co.uk	$2a$12$mBCSsk5VgkvW3QVE/XRZ3uMYbq4XMAsQ8CLymSHAescQrmylCfw5m	WAITER_CASHIER	cmq118uq30001cuonmbe5ypw9	STZ-WTC-MCR-002	23500.00	AFTERNOON	ACTIVE	2022-07-01 00:00:00	Floor Team	2026-06-05 14:42:00.732
cmq118vvn006pcuonlwldds1o	Jane	Smith	jane@steakz.co.uk	$2a$12$UoHkrssrc5T5WIWKbS..1ONHdf0j/DKpHJ2q9CP4J6JKkzLE4gRky	CUSTOMER	\N	\N	\N	\N	\N	\N	\N	2026-06-05 14:41:51.204
cmq119424007bcuon3ins03xg	Tom	Harrison	chef.manchester@steakz.co.uk	$2a$12$XjhKnd0Mdg60ncOhFo/YV.FcyWrE0M/NG33aoNFvmNuOmIj0kmb4y	CHEF	cmq118uq30001cuonmbe5ypw9	STZ-CHF-MCR-001	32000.00	MORNING	ACTIVE	2021-10-15 00:00:00	Kitchen Team	2026-06-05 14:42:01.804
cmq1195gj007fcuon74t4wd4g	Claire	Robinson	manager.leeds@steakz.co.uk	$2a$12$c/mAcrMUhdDynjVN3YX7.euzPOukNyNQMIWbUcpP9UHs.xwh8xna2	BRANCH_MANAGER	cmq118uq60002cuonb0b9udoy	STZ-BRM-LDS-001	38000.00	FLEXIBLE	ACTIVE	2022-01-01 00:00:00	Management	2026-06-05 14:42:03.619
cmq11965n007hcuon020rnbvi	Jake	Wilson	waiter.leeds@steakz.co.uk	$2a$12$JMn7DqlJyg0SkRGKLn89kePZ7yP9i1dtkNVI2RQtoEdRuDSxfcwe2	WAITER_CASHIER	cmq118uq60002cuonb0b9udoy	STZ-WTC-LDS-001	24000.00	MORNING	ACTIVE	2022-03-01 00:00:00	Floor Team	2026-06-05 14:42:04.523
cmq118wjr006rcuonhrh7mqpj	System	Admin	admin@steakz.co.uk	$2a$12$GPHPf/aFGNXuM0RjhNyZ..ivpwV8dHBbYwJED5xOAstg.7bfZN6i6	ADMIN	\N	STZ-ADM-001	48000.00	FLEXIBLE	ACTIVE	2021-03-01 00:00:00	Corporate	2026-06-05 14:41:52.071
cmq1196vn007jcuon4shotk5l	Chloe	Brown	waiter.leeds2@steakz.co.uk	$2a$12$9VtbGJEiLJRp2hR7GbXgRe4p0T6ZmHwjzPdO.D1QWWsfYsFcUedbi	WAITER_CASHIER	cmq118uq60002cuonb0b9udoy	STZ-WTC-LDS-002	23500.00	AFTERNOON	ACTIVE	2022-08-01 00:00:00	Floor Team	2026-06-05 14:42:05.46
cmq1197oh007lcuonttbbcjtx	Sven	Andersen	chef.leeds@steakz.co.uk	$2a$12$YkQpJXaUCNmEd.1xXD6Av.rDNxP8a65587vrrR7ynlSwIZ9QvBNQe	CHEF	cmq118uq60002cuonb0b9udoy	STZ-CHF-LDS-001	32000.00	MORNING	ACTIVE	2022-01-15 00:00:00	Kitchen Team	2026-06-05 14:42:06.494
cmq1198fi007ncuonlvvhejuk	Fatima	Ali	kitchen.leeds@steakz.co.uk	$2a$12$jfc3PXShJ8LLO6AEfnqBTOHKSS5XvhqOkvan0P5Rl7XGRvYDK7GGG	KITCHEN_ASSISTANT	cmq118uq60002cuonb0b9udoy	STZ-KTA-LDS-001	21000.00	MORNING	ACTIVE	2022-05-01 00:00:00	Kitchen Team	2026-06-05 14:42:07.47
cmq11995k007pcuonfh5kabpk	David	Evans	manager.birmingham@steakz.co.uk	$2a$12$5Ec5GYywR0q6YuCeqcro2eDpSrBQu7hqiREUqIGdfNb704YPxDKYC	BRANCH_MANAGER	cmq118uq90003cuonl9nim67p	STZ-BRM-BHM-001	38000.00	FLEXIBLE	ACTIVE	2021-11-01 00:00:00	Management	2026-06-05 14:42:08.408
cmq1199wb007rcuon23bw9ej6	Naomi	James	waiter.birmingham@steakz.co.uk	$2a$12$fYJ7N.Tvjg7tF4iU6XfCVOCNIsxG2ua8mFfJyxCSVfV.xRlHTUC/.	WAITER_CASHIER	cmq118uq90003cuonl9nim67p	STZ-WTC-BHM-001	24000.00	MORNING	ACTIVE	2022-02-15 00:00:00	Floor Team	2026-06-05 14:42:09.371
cmq119and007tcuond7iixom3	Owen	Phillips	waiter.birmingham2@steakz.co.uk	$2a$12$ajIlSA0UV2/hYOxp/AgBY.B1RjOjkKTPneiQE2afmtartrmqsi9me	WAITER_CASHIER	cmq118uq90003cuonl9nim67p	STZ-WTC-BHM-002	23500.00	AFTERNOON	ACTIVE	2022-09-01 00:00:00	Floor Team	2026-06-05 14:42:10.345
cmq119ban007vcuonvi8vz6zl	Kenji	Nakamura	chef.birmingham@steakz.co.uk	$2a$12$S/62R7sYLXYYjrm.0GWC9ulo7m9QJSMdfoIjnz1zodwpC3bM5tKl6	CHEF	cmq118uq90003cuonl9nim67p	STZ-CHF-BHM-001	32000.00	MORNING	ACTIVE	2021-11-15 00:00:00	Kitchen Team	2026-06-05 14:42:11.183
cmq119bzh007xcuonmpkar2o4	Mei	Chen	kitchen.birmingham@steakz.co.uk	$2a$12$6hVLJakbWUwXqLt46Q7MQuiVK6YOewzuZRvAw80597MUthbbyBlAa	KITCHEN_ASSISTANT	cmq118uq90003cuonl9nim67p	STZ-KTA-BHM-001	21000.00	MORNING	ACTIVE	2022-06-01 00:00:00	Kitchen Team	2026-06-05 14:42:12.077
cmq119clh007zcuonc7uo7m2e	Sarah	Kelly	manager.liverpool@steakz.co.uk	$2a$12$4PoVkLdVoi59F8ZnM7jmReaMbaAm/yzMSWDR0CXynaxuaaHglZXeO	BRANCH_MANAGER	cmq118uqc0004cuonac33ndz8	STZ-BRM-LPL-001	38000.00	FLEXIBLE	ACTIVE	2022-02-01 00:00:00	Management	2026-06-05 14:42:12.869
cmq119d9j0081cuon2flvofg7	Ryan	Murphy	waiter.liverpool@steakz.co.uk	$2a$12$PxWhxPh089U8y.L/3ASk/.HeTq5/4OAS6Q6JFxsL/1z1BwfM6mk8e	WAITER_CASHIER	cmq118uqc0004cuonac33ndz8	STZ-WTC-LPL-001	24000.00	MORNING	ACTIVE	2022-04-01 00:00:00	Floor Team	2026-06-05 14:42:13.735
cmq119dy40083cuonv2b7gjnw	Grace	Connor	waiter.liverpool2@steakz.co.uk	$2a$12$zd6cdMCJTdpr4DJAy7zFDOoz6Y4hZN675WUsO4dF/5JD2H5h4rrW6	WAITER_CASHIER	cmq118uqc0004cuonac33ndz8	STZ-WTC-LPL-002	23500.00	AFTERNOON	ACTIVE	2022-10-01 00:00:00	Floor Team	2026-06-05 14:42:14.62
cmq119enf0085cuonj98ydajo	Carlos	Mendez	chef.liverpool@steakz.co.uk	$2a$12$pYhfGI4dmFxaZ.8FPpu2bu5qvlhPdnhjAy26O7nP6iWRgFC8Q2MgO	CHEF	cmq118uqc0004cuonac33ndz8	STZ-CHF-LPL-001	32000.00	MORNING	ACTIVE	2022-02-15 00:00:00	Kitchen Team	2026-06-05 14:42:15.531
cmq119fd60087cuon0tepda9f	Yemi	Okafor	kitchen.liverpool@steakz.co.uk	$2a$12$S8galvrjCGjgzoYtAYkMZe/st.KYQoLhY6JrMMrMOfFbE6aIdex3.	KITCHEN_ASSISTANT	cmq118uqc0004cuonac33ndz8	STZ-KTA-LPL-001	21000.00	MORNING	ACTIVE	2022-07-01 00:00:00	Kitchen Team	2026-06-05 14:42:16.459
cmq1194q5007dcuonovtbc3st	Priya	Singh	kitchen.manchester@steakz.co.uk	$2a$12$bDiq9Oc3WH4VuWjkiFNZ..pnoXILHyZWEvqsQGGCtjt0R3E3qg93K	KITCHEN_ASSISTANT	cmq118uq30001cuonmbe5ypw9	STZ-KTA-MCR-001	21000.00	MORNING	ACTIVE	2022-04-01 00:00:00	Kitchen Team	2026-06-05 14:42:02.669
cmq118x8z006tcuon8i9s62a0	HQ	Manager	hq@steakz.co.uk	$2a$12$j5YFEPxGpr6SFDSE9FaXY.NMP9EgMTl1WNSkFiaY5GLspUX15hN4O	HQ_MANAGER	\N	STZ-HQM-001	58000.00	FLEXIBLE	ACTIVE	2021-06-01 00:00:00	Corporate	2026-06-05 14:41:52.977
cmq11913s0073cuon10qn5b91	Aisha	Patel	kitchen.london@steakz.co.uk	$2a$12$ElJ25fD9geqEWf5TjkTVTOljR.7NxDYJbyIzHYnj6jlaSIBEywE2C	KITCHEN_ASSISTANT	cmq118upo0000cuonozp6ur0p	STZ-KTA-LON-001	21000.00	MORNING	ACTIVE	2022-03-01 00:00:00	Kitchen Team	2026-06-05 14:41:57.976
cmq9cdnxv000rfx7lipos2bx3	Jane	Doe	janedoe123@gmail.com	$2a$12$Zvy3gD8efMWH5PljWLU7GufRMsuzp2kBWCX26ZrLHxi9hXhkeenUC	CUSTOMER	\N	\N	\N	\N	\N	\N	\N	2026-06-11 10:15:39.376
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
38fe225b-5392-41c6-b778-1edf8ce9426a	cb20e1e52b2f8b0dd44c278f09370d389026666256b70191ed4d21e6650ecf10	2026-06-05 16:41:29.616495+02	20260605144126_init	\N	\N	2026-06-05 16:41:26.487262+02	1
88fcab37-bcad-4da8-a791-ccf3271d2440	3b66bcde02a9f779ae21058b097ff765fd122d8aabab7dc80a3ded81d5794387	2026-06-05 21:50:53.642115+02	20260605195053_add_notifications_campaigns_receipts	\N	\N	2026-06-05 21:50:53.576825+02	1
d7087843-686b-4370-a4bc-42459a416233	848ffe8fc4252fd4f8efeb97d0f8a8c71058a881352a242f6988e944f8e3ecbb	2026-06-06 23:43:59.305317+02	20260606214359_add_newsletter_subscription	\N	\N	2026-06-06 23:43:59.276196+02	1
5373b57e-fdb0-4627-a60a-149081489469	9ea64b6cd10c5533447f2e26fdbf761abd12d309d35eacac10d7d24931e7d18f	2026-06-07 02:40:29.652842+02	20260607004029_add_newsletter_name	\N	\N	2026-06-07 02:40:29.64449+02	1
90dd0a43-4e51-4952-a9b7-07bea93283fc	14620209c85bd18bcaff581f362a47feb70e2842e635305ca8bde0329a0839f4	2026-06-07 11:47:27.73635+02	20260607094727_add_audit_logs	\N	\N	2026-06-07 11:47:27.714204+02	1
1e52c7c6-2890-4d33-a498-52cf97880ca3	a9a3ac4aa3584fa0b92598bc68e3c69896d36393162dc2cffafc4deae0b0e2eb	2026-06-07 19:17:05.445338+02	20260607171705_add_reservation_statuses	\N	\N	2026-06-07 19:17:05.434303+02	1
5fb95e9f-91fb-4d95-b5e6-06c990f95030	001099623285298926a98b76ad404a9a3f15cb209bcd82bf8bbbb2e9df28fd90	2026-06-07 21:56:51.319895+02	20260607195651_add_inventory_unit	\N	\N	2026-06-07 21:56:51.303435+02	1
214ec36b-85a5-4ba4-a5aa-583c9e738bc4	daeab6882bf94d33d5147f3b7c090a3cce279ede8a27f5ec1278bbf6b5853263	2026-06-08 00:21:11.111019+02	20260607222111_add_payment_pending_table_status	\N	\N	2026-06-08 00:21:11.100282+02	1
6b20a065-39a1-4909-9bd7-c0f90446fa4d	2f7284e0ee57c7d410be2c7f7e3582d1c58a6a224194aa6ddaa2e37f16606923	2026-06-08 00:22:26.401356+02	20260607222226_add_order_on_table_status	\N	\N	2026-06-08 00:22:26.393974+02	1
d91b2ac1-de66-4f56-9a43-b30df21bcab5	e5e875eca41de3b953c2662895e082585129e30adb6368003a3ef168742fbe4b	2026-06-08 00:23:11.22481+02	20260607222311_add_inventory_category	\N	\N	2026-06-08 00:23:11.209741+02	1
\.


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BasketItem BasketItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BasketItem"
    ADD CONSTRAINT "BasketItem_pkey" PRIMARY KEY (id);


--
-- Name: Basket Basket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Basket"
    ADD CONSTRAINT "Basket_pkey" PRIMARY KEY (id);


--
-- Name: Branch Branch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_pkey" PRIMARY KEY (id);


--
-- Name: Campaign Campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campaign"
    ADD CONSTRAINT "Campaign_pkey" PRIMARY KEY (id);


--
-- Name: InventoryTransaction InventoryTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryTransaction"
    ADD CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY (id);


--
-- Name: Inventory Inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY (id);


--
-- Name: MenuCategory MenuCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MenuCategory"
    ADD CONSTRAINT "MenuCategory_pkey" PRIMARY KEY (id);


--
-- Name: MenuItem MenuItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterSubscription NewsletterSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSubscription"
    ADD CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: Receipt Receipt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Receipt"
    ADD CONSTRAINT "Receipt_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: Reservation Reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY (id);


--
-- Name: Table Table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Branch_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Branch_email_key" ON public."Branch" USING btree (email);


--
-- Name: Branch_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Branch_name_key" ON public."Branch" USING btree (name);


--
-- Name: Inventory_branchId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Inventory_branchId_idx" ON public."Inventory" USING btree ("branchId");


--
-- Name: NewsletterSubscription_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "NewsletterSubscription_email_key" ON public."NewsletterSubscription" USING btree (email);


--
-- Name: Order_basketId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_basketId_key" ON public."Order" USING btree ("basketId");


--
-- Name: Payment_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payment_orderId_key" ON public."Payment" USING btree ("orderId");


--
-- Name: RefreshToken_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "RefreshToken_token_key" ON public."RefreshToken" USING btree (token);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_employeeId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_employeeId_key" ON public."User" USING btree ("employeeId");


--
-- Name: BasketItem BasketItem_basketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BasketItem"
    ADD CONSTRAINT "BasketItem_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES public."Basket"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BasketItem BasketItem_menuItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BasketItem"
    ADD CONSTRAINT "BasketItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Basket Basket_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Basket"
    ADD CONSTRAINT "Basket_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Basket Basket_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Basket"
    ADD CONSTRAINT "Basket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Campaign Campaign_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campaign"
    ADD CONSTRAINT "Campaign_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Campaign Campaign_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campaign"
    ADD CONSTRAINT "Campaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InventoryTransaction InventoryTransaction_inventoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryTransaction"
    ADD CONSTRAINT "InventoryTransaction_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES public."Inventory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inventory Inventory_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuItem MenuItem_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."MenuCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_menuItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_basketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES public."Basket"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public."Table"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_waiterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_waiterId_fkey" FOREIGN KEY ("waiterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Receipt Receipt_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Receipt"
    ADD CONSTRAINT "Receipt_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Receipt Receipt_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Receipt"
    ADD CONSTRAINT "Receipt_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reservation Reservation_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public."Table"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Table Table_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict dm6EDVR7enDH317nVoL9IoloKxbdaoKKqc9QgPKRd5jJUlTRWRWl5b73F5dX6rS

