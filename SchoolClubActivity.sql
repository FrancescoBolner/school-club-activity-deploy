-- DROP IN CORRECT ORDER (because of foreign keys)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS person;
DROP TABLE IF EXISTS clubs;

-- ====== CREATE TABLES ======
CREATE TABLE `clubs` (
    `clubName` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `memberCount` int NOT NULL,
    `memberMax` int NOT NULL,
    PRIMARY KEY (`clubName`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE `person` (
    `username` varchar(255) NOT NULL,
    `password` text NOT NULL,
    `role` text NOT NULL,
    `club` varchar(255) DEFAULT NULL,
    `sessionId` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`username`),
    UNIQUE KEY `sessionId` (`sessionId`),
    KEY `club` (`club`),
    CONSTRAINT `person_ibfk_1` FOREIGN KEY (`club`) REFERENCES `clubs` (`clubName`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE `events` (
    `eventid` int NOT NULL AUTO_INCREMENT,
    `date` date NOT NULL,
    `title` text,
    `description` text,
    `clubName` varchar(255) NOT NULL,
    PRIMARY KEY (`eventid`),
    KEY `clubName` (`clubName`),
    CONSTRAINT `events_ibfk_1` FOREIGN KEY (`clubName`) REFERENCES `clubs` (`clubName`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 11 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE `comments` (
    `commentid` int NOT NULL AUTO_INCREMENT,
    `date` datetime DEFAULT NULL,
    `comment` text NOT NULL,
    `rating` int NOT NULL,
    `username` varchar(255) NOT NULL,
    `clubName` varchar(255) NOT NULL,
    PRIMARY KEY (`commentid`),
    KEY `username` (`username`),
    KEY `clubName` (`clubName`),
    CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`username`) REFERENCES `person` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `comments_ibfk_4` FOREIGN KEY (`clubName`) REFERENCES `clubs` (`clubName`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 12 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

-- ====== CLUBS (parents: must exist before persons/events/comments) ======
INSERT INTO clubs (clubName, description, memberCount, memberMax) VALUES
('Ski', 'Mountain adventurers: apres-ski, hot chocolate battles and occasional avalanche avoidance.', 4, 30),
('Basketball', 'Hoops, trash-talk, and gym-floor legends.', 5, 40),
('Baseball', 'Sun, bats, and the slow-burning rivalry with the Soccer club.', 3, 25),
('Chess', 'Quiet intensity, checkmates at midnight, and stolen pawns.', 6, 20),
('Music', 'Jam sessions, terrible karaoke and one glorious perfect chord.', 7, 30),
('Drama', 'Costumes, last-minute line changes and the yearly tragedy-turned-comedy. ', 5, 25);

-- ====== PERSON (users) ======
INSERT INTO person (username, password, role, club, sessionId) VALUES
('Francesco', '123456', 'CL', 'Ski', NULL),
('Giorgie', 'password', 'CL', 'Basketball', 'akenfue3kd'),
('Ayoub', 'ayoub1', 'STU', 'Basketball', NULL),
('Samuele', 'gocciole', 'CM', 'Ski', NULL),
('Ari', 'ari_pw', 'STU', 'Ski', NULL),
('Luca', 'l0v3code', 'VP', 'Chess', 'sess_9a1b2c'),
('Martina', 'martina!', 'STU', 'Music', NULL),
('Elena', 'el3na', 'STU', NULL, NULL),
('Marco', 'basehit', 'CL', 'Baseball', 'sess_base45'),
('Zoe', 'zoe123', 'STU', 'Drama', NULL),
('Nina', 'pianist', 'CM', 'Music', 'sess_mus99'),
('Paolo', 'paolo_pw', 'STU', 'Chess', NULL),
('Clara', 'clara_pw', 'VP', 'Drama', 'sess_dr12');

-- ====== EVENTS (each references a clubName) ======
INSERT INTO events (date, title, description, clubName) VALUES
('2025-11-02', 'Apres-ski Pancake Panic', 'The pancake stove exploded during the apres-ski. Turns out butter + campfire = chaos. Pancakes still edible.', 'Ski'),
('2025-11-10', 'Night Hoops: 3-pt Challenge', 'Late-night friendly tournament where Giorgie swore she could beat everyone with her eyes closed.', 'Basketball'),
('2025-10-28', 'Baseball Backfield BBQ', 'Hot dogs, a lost mitt and Marco''s legendary double play story that becomes more dramatic each telling.', 'Baseball'),
('2025-11-15', 'Chess Blitz Marathon', 'Blitz games, whispered taunts, and one game that lasted 65 moves into the early morning.', 'Chess'),
('2025-12-01', 'Winter Concert Rehearsal', 'Last rehearsal before the winter concert. Nina refuses to tune the piano "for authenticity".', 'Music'),
('2025-10-31', 'Halloween Play: The Unplanned Hamlet', 'A tragicomic performance where the prince forgot his lines and the ghost improvised an epic monologue.', 'Drama'),
('2025-11-20', 'Ski Safety Workshop', 'Learn how to fall with dignity. Hot cocoa afterward.', 'Ski'),
('2025-12-05', 'Interclub Talent Show', 'All clubs participate: juggling, slam poetry, and an unannounced kazoo trio.', 'Music'),
('2025-11-18', 'Friendly Match: Basketball vs. Local Teachers', 'Spoiler: teachers are surprisingly competitive.', 'Basketball'),
('2025-11-22', 'Open Board Night', 'Casual games night with pizza — bring your own set or borrow one!', 'Chess');

-- ====== COMMENTS (each references username and clubName) ======
INSERT INTO comments (date, comment, rating, username, clubName) VALUES
('2025-10-29 09:00:00', 'Samuele ate all the gocciole!!1!', 1, 'Francesco', 'Ski'),
('2025-11-02 10:15:00', 'Apres-ski was a success despite the pancake fiasco — Ari saved the syrup.', 5, 'Ari', 'Ski'),
('2025-11-03 20:05:00', 'Giorgie''s no-look 3-pointer is still a myth. She did it. We have video.', 5, 'Ayoub', 'Basketball'),
('2025-11-04 18:30:00', 'Marco hit an impossible ball that landed in the neighbor''s garden. We negotiated its return with cookies.', 4, 'Paolo', 'Baseball'),
('2025-11-06 21:00:00', 'Luca sacrificed a rook to win by fork  — poetic.', 5, 'Clara', 'Chess'),
('2025-12-01 19:45:00', 'Nina made the piano sound like a snowstorm. Magical and slightly off-tempo.', 5, 'Martina', 'Music'),
('2025-10-31 22:10:00', 'The Unplanned Hamlet turned into improv gold. Zoe''s line about ham stole the show.', 5, 'Elena', 'Drama'),
('2025-11-15 09:00:00', 'I think I learned a new opening. Or forgot the last one. Either way, good morning mates.', 4, 'Luca', 'Chess'),
('2025-11-20 12:00:00', 'Ski Safety Workshop actually taught me how to fall without breaking something. Miracle.', 5, 'Francesco', 'Ski'),
('2025-12-05 22:30:00', 'The kazoo trio deserves a national award. Or a fine.', 5, 'Martina', 'Music'),
('2025-11-18 20:00:00', 'Teachers played dirty. We demand a rematch.', 3, 'Ayoub', 'Basketball'),
('2025-11-22 19:30:00', 'Pizza and pawns: best night ever.', 5, 'Paolo', 'Chess'),
('2025-11-10 19:10:00', 'Giorgie let us win once. She called it "strategic mercy".', 4, 'Zoe', 'Basketball'),
('2025-11-02 11:00:00', 'Found a secret stash of marshmallows at the ski lodge. Samuele claims innocence.', 4, 'Ari', 'Ski'),
('2025-11-05 17:00:00', 'Drama costumes almost caused a small fire. Clara''s cape is a tactical hazard.', 2, 'Elena', 'Drama'),
('2025-11-12 14:20:00', 'We played music and the lights went out. We kept playing. It was intimate.', 5, 'Nina', 'Music'),
('2025-11-25 10:00:00', 'Someone replaced all chess clocks with egg timers. Chaos ensued.', 4, 'Luca', 'Chess');

-- ====== update club memberCounts to reflect inserted people (not required but nice) ======
UPDATE clubs SET memberCount = (
  SELECT COUNT(*) FROM person WHERE person.club = clubs.clubName AND NOT person.role = 'STU'
) WHERE clubName IN ('Ski','Basketball','Baseball','Chess','Music','Drama');

-- ====== End of seed data ======
