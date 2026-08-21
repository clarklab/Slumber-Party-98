/** Dialogue trees. Photos are how the night gets told. */

export const CHATS = {
  jess: {
    start: {
      flags: ["talked_jess"],
      clues: [{ id: "talked_jess", note: "Jess: Mandy left WITH me around 1am. Her mom called at 8." }],
      messages: [
        { from: "jess", text: "sarah????" },
        { from: "jess", text: "are you even ON" },
        { from: "jess", text: "mandy never got home. her mom called my house at 8 and i had to LIE" },
        { from: "jess", text: "i said she left at 1 with YOU so she should be FINE" },
        { from: "jess", text: "...she DID leave with you. i have lo's picture. the maple one." },
        { from: "jess", text: "[[photo:leaving|IMG_008 you two walking away]]  look at it. that's my porch light. that's you." },
        { from: "jess", text: "[[news:missing|did ya SEE the gazette already?????]] they used her yearbook picture like she's already a poster" },
      ],
      choices: [
        { text: "yeah we walked together. i went home. she kept going.", next: "walk", flags: ["told_jess_walked"] },
        { text: "wait she didn't get HOME???", next: "shock" },
        { text: "i barely remember leaving. i just woke up.", next: "forget", flags: ["pretend_amnesia"] },
      ],
    },
    walk: {
      flags: ["jess_walk"],
      clues: [{ id: "path_story", note: "You told Jess you split up. She still has the leaving photo." }],
      messages: [
        { from: "jess", text: "ok so you SAW her after maple. after that picture." },
        { from: "jess", text: "because IMG_008 is 1:07 and then you two are just... gone into the trees" },
        { from: "jess", text: "did you take the creek path. be honest. chloe already told my mom the board spelled CREEK like that's helpful" },
      ],
      choices: [
        { text: "we stayed on maple. i'm not stupid.", next: "mom", flags: ["denied_creek"] },
        { text: "the creek is faster. we might have.", next: "creek", flags: ["admitted_creek"] },
        { text: "has anyone talked to tyler", next: "tyler" },
      ],
    },
    shock: {
      messages: [
        { from: "jess", text: "DO NOT play shocked at me. you were THERE." },
        { from: "jess", text: "look at the pizza picture and then look at maple. that's the whole night. we started with roma boxes and ended with you walking her into the dark." },
        { from: "jess", photo: "pizza", text: "[[photo:pizza|IMG_001]] 7:42pm. all six. she has sauce on her face. she's FINE." },
        { from: "jess", text: "you don't get to log on at 9:41 and be like 'wait what'" },
      ],
      choices: [
        { text: "ok. we walked. i went home.", next: "walk", flags: ["told_jess_walked"] },
        { text: "your mom already left, right? she didn't see us go?", next: "mom" },
      ],
    },
    forget: {
      flags: ["jess_thinks_youre_weird"],
      messages: [
        { from: "jess", text: "you 'don't remember' leaving." },
        { from: "jess", text: "lo has a timestamp. 1:07 AM. your denim jacket. mandy's stupid cardigan. [[photo:leaving|look]]" },
        { from: "jess", text: "people who don't remember things still show up in pictures sarah" },
      ],
      choices: [
        { text: "i remember the picture. i don't remember after.", next: "creek" },
        { text: "fine. we walked. what did you tell her mom?", next: "mom" },
      ],
    },
    creek: {
      flags: ["jess_creek"],
      clues: [{ id: "jess_creek", note: "Jess knows the creek path is how you'd go. Chloe already said the board spelled CREEK." }],
      messages: [
        { from: "jess", text: "the creek." },
        { from: "jess", text: "chloe is going to combust. she already sent my dad a tropicana page like he's going to read an encyclopedia" },
        { from: "jess", text: "[[wiki:creek|Old Mill Creek]]  i HATE that she was right about the letters" },
        { from: "jess", text: "if you took her that way you tell me RIGHT NOW because her mom is calling every house on maple" },
      ],
      choices: [
        { text: "we cut that way. it was faster.", next: "mom", flags: ["admitted_creek"] },
        { text: "i don't want to talk about the board.", next: "mom" },
      ],
    },
    tyler: {
      flags: ["asked_tyler_jess"],
      messages: [
        { from: "jess", text: "TYLER." },
        { from: "jess", text: "he tapped on the window like a vampire. lo got a picture. i could KILL her. [[photo:window|IMG_006]]" },
        { from: "jess", text: "mom had been gone like fifteen minutes. that's why he came. mandy told him the wedding thing." },
        { from: "jess", text: "his sn is tytyb_11 if you want to make this worse" },
        { from: "jess", text: "he left. that's the point. HE left. mandy stayed. then we did the board. then YOU left with her." },
      ],
      choices: [
        { text: "did mandy want him there?", next: "mom" },
        { text: "i need to look at the window picture again.", next: "mom", open: { photo: "window" } },
      ],
    },
    mom: {
      flags: ["jess_mom"],
      clues: [{ id: "mom_left", note: "Diane Hart checked once (IMG_004, 9:36pm), then left for a wedding in Toledo. No adult after 9:47." }],
      messages: [
        { from: "jess", text: "mom did ONE check. lo flashed her on the stairs like a maniac." },
        { from: "jess", photo: "mom", text: "[[photo:mom|IMG_004]] look at her EYES. chloe screamed. mom said be good, lights out by 11, then she drove to toledo for aunt carrie." },
        { from: "jess", text: "we laid the sleeping bags out on purpose so that picture would look like bedtime. [[photo:bags|IMG_003]]  it was a SET. we were never going to sleep." },
        { from: "jess", text: "if mom sees these she's going to know we were up for the window AND the board AND you leaving." },
        { from: "jess", text: "sarah. what do the other girls know. that's what i'm actually asking." },
      ],
      choices: [
        { text: "i'm checking with everyone. don't panic.", next: "wait" },
        { text: "chloe's going to make this about ghosts.", next: "wait" },
        { text: "lauren has the whole night on that roll.", next: "wait", flags: ["jess_knows_roll"] },
      ],
    },
    wait: {
      messages: [
        { from: "jess", text: "i'm sitting in the kitchen with the pizza boxes still out. it smells like last night. it shouldn't still smell like last night." },
        { from: "jess", text: "IM me the second anybody says they saw you after maple." },
        { from: "jess", text: "and look at the pictures in order if you haven't. pizza. movie. bags. mom. after she left. window. board. leaving. that's the party. that's all of us being stupid." },
        { from: "jess", text: "i keep looking at IMG_001 like i can put her back in the basement" },
      ],
      choices: [
        { text: "i'll look at the roll.", next: "idle", open: { photo: "pizza" } },
        { text: "i'm going to talk to lauren.", next: "idle", open: { buddy: "lauren" } },
      ],
    },
    idle: {
      messages: [{ from: "sys", text: "jessicap3aches is still signed on. she keeps opening the same picture." }],
      choices: [
        { text: "you still there?", next: "wait" },
        { text: "about the movie — why that tape?", next: "movie" },
        { text: "brb.", exit: true },
      ],
    },
    police: {
      flags: ["jess_police"],
      messages: [
        { from: "jess", text: "sarah" },
        { from: "jess", text: "the police are in my KITCHEN" },
        { from: "jess", text: "they want the pictures. they want IMG_001 through 008 like it's a timeline." },
        { from: "jess", text: "mom drove back from toledo. she saw IMG_004 of herself on the stairs and started crying." },
        { from: "jess", text: "they keep asking who walked mandy home. i keep saying your name. that's the maple picture. that's not a rumor that's a timestamp." },
        { from: "jess", text: "[[news:search|channel 7 is already at the creek]]  chloe told them the letters. i could kill her." },
      ],
      choices: [
        { text: "i only walked her to maple.", next: "police2" },
        { text: "jess i'm scared.", next: "police2" },
      ],
    },
    police2: {
      messages: [
        { from: "jess", text: "then you stay signed on. you don't get to disappear into a computer." },
      ],
      exit: "i'm here.",
    },
    found: {
      flags: ["body_found"],
      messages: [
        { from: "jess", text: "they found her" },
        { from: "jess", text: "oh my god they found her" },
        { from: "jess", text: "[[news:found|the gazette just updated]]" },
        { from: "jess", text: "the creek. chloe's stupid letters. the shortcut off maple." },
        { from: "jess", text: "lo is on the other line with her sister. she keeps saying she has one more picture. sarah what does that mean." },
      ],
      choices: [{ text: "i don't know.", exit: true }],
    },
    movie: {
      messages: [
        { from: "jess", text: "because dad said PG13 and chloe wanted The Craft which is R if the clerk is awake." },
        { from: "jess", text: "so we got [[wiki:ikwydls|I Know What You Did Last Summer]]  which is FUNNY now, sarah. it's funny in a way that's going to make me throw up." },
        { from: "jess", photo: "movie", text: "[[photo:movie|IMG_002]] mandy sat next to you. she kept peeking through her hands. you remember that. don't lie." },
      ],
      choices: [{ text: "i remember.", next: "wait" }],
    },
  },

  lauren: {
    start: {
      flags: ["talked_lauren"],
      clues: [{ id: "talked_lauren", note: "Lauren developed the disposable at Walgreens 1-hour. She wants you to look at the night IN ORDER." }],
      messages: [
        { from: "lauren", text: "hey" },
        { from: "lauren", text: "walgreens had the 1-hour. i have the whole night in an envelope on my bed." },
        { from: "lauren", text: "you have to look at them in order or it turns into random basement noise. it's a story. i shot it like a story even when i didn't mean to." },
        { from: "lauren", text: "first frame. 7:42. pizza. all six of us still in the same world." },
        { from: "lauren", photo: "pizza", text: "[[photo:pizza|IMG_001 — roma boxes]] mandy's the slice-in-mouth one. you're on her left. britt's already annoyed. chloe's flash made us look dead in a nice way." },
      ],
      choices: [
        { text: "we look like babies.", next: "movie" },
        { text: "send the next one.", next: "movie" },
        { text: "is there one of just mandy?", next: "movie", flags: ["asked_mandy_alone"] },
      ],
    },
    movie: {
      flags: ["saw_roll_movie"],
      clues: [{ id: "movie_secret", note: "They rented I Know What You Did Last Summer (PG-13). Mandy sat next to you. A movie about a secret." }],
      messages: [
        { from: "lauren", text: "8:31. the rental. dad-rule: pg-13." },
        { from: "lauren", photo: "movie", text: "[[photo:movie|IMG_002 — the CRT]] we put on I Know What You Did Last Summer because The Craft was R and britt refused a 'witch movie' anyway." },
        { from: "lauren", text: "mandy said it's about keeping a secret until it kills you. britt said it's about a hook. you didn't say anything. you were watching her watch it." },
        { from: "lauren", text: "i didn't notice that until i was holding the print this morning. that's the thing about pictures. they tell on you later." },
      ],
      choices: [
        { text: "i was just watching the movie.", next: "bags" },
        { text: "you're reading into it.", next: "bags", flags: ["told_lauren_reading"] },
        { text: "keep going.", next: "bags" },
      ],
    },
    bags: {
      messages: [
        { from: "lauren", text: "9:18. we unrolled the bags so it would LOOK like a slumber party." },
        { from: "lauren", photo: "bags", text: "[[photo:bags|IMG_003]]  fake bedtime. your navy bag is the one with the broken zipper. mandy's purple one by the lava lamp. we did this BEFORE jess's mom came down so she'd see 'sleepover' and not 'ritual.'" },
        { from: "lauren", text: "props. the whole night had props. pizza was a prop. bags were a prop. the movie was a prop so we weren't sitting there waiting for a boy." },
      ],
      choices: [
        { text: "and then her mom looked in.", next: "mom" },
        { text: "this still feels like a normal night in these.", next: "mom" },
      ],
    },
    mom: {
      flags: ["saw_roll_mom"],
      clues: [{ id: "last_adult", note: "IMG_004: Jess's mom in the doorway, 9:36pm. Last adult. Eyes white from the flash. Then Toledo." }],
      messages: [
        { from: "lauren", text: "9:36. i shouldn't have used the flash on the stairs." },
        { from: "lauren", photo: "mom", text: "[[photo:mom|IMG_004 — Mrs. Hart]] her eyes went white. chloe screamed for real. then she turned it into a joke. diane said be good, eleven, wedding, toledo." },
        { from: "lauren", text: "garage at 9:47. i didn't photograph the garage. i wish i photographed the garage. that's the last grown-up." },
        { from: "lauren", text: "after this picture there is no mom. i took one more of the room first. then the window. then the board. then you and mandy on maple." },
        { from: "lauren", text: "chloe said the eyes looked like a spirit. i said it's called red-eye you dork. this morning i don't know." },
      ],
      choices: [
        { text: "then what. before tyler.", next: "basement" },
        { text: "the eyes are just the flash.", next: "basement" },
      ],
    },
    basement: {
      flags: ["saw_roll_basement"],
      clues: [{ id: "after_mom", note: "IMG_005, 9:51pm: after mom left. Window still empty. Two minutes of no adult." }],
      messages: [
        { from: "lauren", text: "9:51. two minutes of no adult. i took it because the room felt illegal." },
        { from: "lauren", photo: "basement", text: "[[photo:basement|IMG_005 — after]] nail polish. lava lamp. the window behind chloe still empty. we look like we got away with something." },
        { from: "lauren", text: "then we heard the tap." },
      ],
      choices: [
        { text: "then tyler came.", next: "window" },
        { text: "keep going.", next: "window" },
      ],
    },
    window: {
      messages: [
        { from: "lauren", text: "10:02. him." },
        { from: "lauren", photo: "window", text: "[[photo:window|IMG_006]]  i took it because i didn't know what else to do with my hands. he's looking at mandy. you're a blur on the couch with wet nails." },
        { from: "lauren", text: "he said dog. there is no dog in any picture. i checked. i went through them twice at the counter while the woman asked if we wanted doubles." },
        { from: "lauren", text: "i said no doubles. then i said wait. then i said no again." },
      ],
      choices: [
        { text: "delete that one. he'll get in trouble.", next: "ouija", flags: ["wanted_window_deleted"] },
        { text: "mandy looked happy after he left.", next: "ouija", flags: ["noticed_mandy_happy"] },
        { text: "show me the board.", next: "ouija" },
      ],
    },
    ouija: {
      flags: ["saw_roll_ouija"],
      clues: [{ id: "two_cheaters", note: "IMG_007: Lauren says zoom in — two white knuckles on the planchette. Mandy's. Yours." }],
      messages: [
        { from: "lauren", text: "11:14. this is the one i kept turning over on the drive home from walgreens." },
        { from: "lauren", photo: "ouija", text: "[[photo:ouija|IMG_007]] zoom in until it hurts. mandy's knuckle is white. yours is white. two people pushing. both pretending it's a ghost so nobody has to be the girl who wanted her name on the board." },
        { from: "lauren", text: "chloe copied letters on jess's computer. [[file:letters|ouija_letters.txt]]  MANDY then CREEK then HAND." },
        { from: "lauren", text: "you looked at her like you caught her. she looked at you like she caught you. that's in your faces. i don't even need the board." },
      ],
      choices: [
        { text: "i didn't move it.", next: "deny", flags: ["denied_planchette"] },
        { text: "she was pushing it. i SAW her.", next: "accuse", flags: ["accused_mandy"] },
        { text: "...both of us were.", next: "both", flags: ["admitted_both"] },
      ],
    },
    deny: {
      messages: [
        { from: "lauren", text: "ok" },
        { from: "lauren", text: "the picture still exists if you didn't" },
        { from: "lauren", text: "that's the mean thing about a disposable. it doesn't care what you decide this morning." },
      ],
      choices: [{ text: "show me maple.", next: "leaving" }],
    },
    accuse: {
      messages: [
        { from: "lauren", text: "i know she was." },
        { from: "lauren", text: "i also know you were." },
        { from: "lauren", text: "that's why i took the picture. not because of spirits. because you two were having a fight with your fingers in the dark and calling it a game." },
      ],
      choices: [{ text: "show me after the board.", next: "leaving" }],
    },
    both: {
      flags: ["lauren_heard_both"],
      clues: [{ id: "both_pushed", note: "You told Lauren the truth about the planchette: both of you were pushing." }],
      messages: [
        { from: "lauren", text: "yeah." },
        { from: "lauren", text: "thanks for not making me be the one to say it." },
        { from: "lauren", text: "the movie was about a secret. then you made a new one on the carpet. then you walked into the trees with her." },
      ],
      choices: [{ text: "the leaving picture.", next: "leaving" }],
    },
    leaving: {
      flags: ["saw_roll_leaving"],
      clues: [{ id: "last_party_frame", note: "IMG_008, 1:07am: you and Mandy walking into the dark. Last party picture. Lauren thought you were just mad about Tyler." }],
      messages: [
        { from: "lauren", text: "1:07 AM. last party frame. i stepped onto the driveway like i was tying my shoe." },
        { from: "lauren", photo: "leaving", text: "[[photo:leaving|IMG_008]]  you and mandy. no waving. your jacket. her cardigan. maple turning into the mill path if you're the kind of angry that doesn't want porch lights." },
        { from: "lauren", text: "i told myself you were mad about tyler and you'd split at the corner and IM me that she was being weird." },
        { from: "lauren", text: "you didn't IM." },
        { from: "lauren", text: "that's the roll. pizza to maple. a whole night that still has her in it until it doesn't." },
        { from: "lauren", text: "there is one more frame on the contact sheet. i'm not sending it yet." },
      ],
      choices: [
        { text: "what do you mean one more.", next: "hold" },
        { text: "lo. send it.", next: "hold" },
        { text: "i don't want to see anything else.", next: "hold", flags: ["afraid_of_ninth"] },
      ],
    },
    hold: {
      flags: ["lauren_holding_ninth"],
      clues: [{ id: "ninth_frame", note: "Lauren is holding back IMG_009. She says it isn't a party picture." }],
      messages: [
        { from: "lauren", text: "it's not from the party." },
        { from: "lauren", text: "i took it after." },
        { from: "lauren", text: "i need to look at it again before i show you. i keep hoping it turned into someone else overnight." },
        { from: "lauren", text: "go talk to people. look at the gazette. write it down in that dumb scratchpad so you can't pretend the order was different." },
        { from: "lauren", text: "if i send it too fast you'll say it's a trick. i don't want you to say it's a trick." },
      ],
      choices: [
        { text: "you're scaring me.", next: "idle" },
        { text: "ok. i'll come back.", next: "idle" },
      ],
    },
    idle: {
      messages: [
        { from: "sys", text: "laurendoodles is looking at a print she has not sent. the envelope says 9 prints. your folder only has 8." },
      ],
      choices: [
        { text: "lo?", next: "hold" },
        { text: "walk me through pizza again.", next: "start" },
        { text: "i'll look around.", exit: true },
      ],
    },
    proof: {
      flags: ["saw_proof", "caught"],
      clues: [{ id: "caught", note: "IMG_009, 5:14 AM. Lauren's porch. You walking up Maple. Mud. Hands. You looked at the flash. You know it's you." }],
      messages: [
        { from: "lauren", text: "okay." },
        { from: "lauren", text: "i couldn't sleep. i sat on the porch with the camera because kayla was driving me to walgreens at 8 and i didn't want to forget it." },
        { from: "lauren", text: "5:14 in the morning. shoes on the leaves." },
        { from: "lauren", text: "the flash went off. i didn't even mean to. you looked right at me." },
        { from: "lauren", photo: "proof", text: "[[photo:proof|IMG_009 — after]]" },
        { from: "lauren", text: "that's your driveway, sarah. that's the jacket from maple. that's mud from the mill stones. that's your face." },
        { from: "lauren", text: "you KNOW it's you. don't make me describe your hands." },
        { from: "lauren", text: "you left with her at 1:07. you came back alone at 5:14 looking like that. they found her at the creek." },
        { from: "lauren", text: "you saw her pushing the planchette. i saw you both in IMG_007. then you took her where there weren't any porch lights." },
        { from: "lauren", text: "i printed a second copy. it's in my backpack. kayla's getting her keys." },
      ],
      choices: [
        { text: "that's not me.", next: "caught_deny" },
        { text: "lo please delete it.", next: "caught_delete" },
        { text: "don't. please don't.", next: "caught_please" },
      ],
    },
    caught_deny: {
      messages: [
        { from: "lauren", text: "sarah." },
        { from: "lauren", text: "it's your driveway." },
        { from: "lauren", text: "you looked at the flash. i watched you decide not to wave." },
        { from: "lauren", text: "you KNOW you're caught. stop using the pictures like they're a story about somebody else." },
      ],
      choices: [{ text: "...", next: "going" }],
    },
    caught_delete: {
      messages: [
        { from: "lauren", text: "it's a PRINT. walgreens. the negatives are in the envelope. you can't delete a morning." },
        { from: "lauren", text: "i already wish i hadn't taken it. i took it anyway. that's how this whole night worked." },
      ],
      choices: [{ text: "...", next: "going" }],
    },
    caught_please: {
      messages: [
        { from: "lauren", text: "i liked you. that's why i shot the pizza first like we were going to want it later." },
        { from: "lauren", text: "i'm still going." },
      ],
      choices: [{ text: "...", next: "going" }],
    },
    going: {
      flags: ["lauren_going_to_cops"],
      messages: [
        { from: "lauren", text: "if you shut the computer off it will still be in my backpack." },
        { from: "lauren", text: "i'm sorry. i'm not sorry enough to keep it." },
        { from: "sys", text: "laurendoodles has signed off" },
      ],
      exit: "...",
    },
  },

  chloe: {
    start: {
      flags: ["talked_chloe"],
      clues: [{ id: "talked_chloe", note: "Chloe copied the letters: YES / MANDY / YES / CREEK / HAND. She wants you to admit the pull." }],
      messages: [
        { from: "chloe", text: "the board knew" },
        { from: "chloe", text: "don't start. i copied the letters down before anyone kicked the flashlight." },
        { from: "chloe", text: "YES. then MANDY. then YES. then CREEK. then HAND." },
        { from: "chloe", text: "[[file:letters|it's on jess's computer]]  and lo got a picture of our hands so nobody can say we weren't touching it. [[photo:ouija|IMG_007]]" },
        { from: "chloe", text: "did you feel it pull. be honest. toward you or toward her." },
        { from: "chloe", text: "[[wiki:ouija|tropicana says it's muscles]]  [[wiki:carrie|i say it's carrie voss]]  i don't even care which one if mandy is missing" },
      ],
      choices: [
        { text: "i didn't move it.", next: "deny", flags: ["denied_chloe"] },
        { text: "chloe... i moved it. a little.", next: "admit", flags: ["admitted_chloe"] },
        { text: "MANDY was moving it. that's the whole thing.", next: "blame", flags: ["blamed_mandy_chloe"] },
      ],
    },
    deny: {
      messages: [
        { from: "chloe", text: "then WHY did you stare at her like that." },
        { from: "chloe", text: "look at IMG_007 and look at your mouth. that's not a ghost face. that's a caught-you face." },
        { from: "chloe", text: "also we watched a movie about a secret for two hours and you picked the sleeping bag farthest from the board after. [[photo:bags|the navy one]]" },
      ],
      choices: [
        { text: "the creek letters. why would it say that.", next: "creek" },
        { text: "jess's mom's eyes in that picture freaked you out.", next: "mom" },
      ],
    },
    admit: {
      flags: ["chloe_has_confession"],
      clues: [{ id: "told_chloe", note: "You told Chloe you moved the planchette. She is going to tell. She thinks that's honesty." }],
      messages: [
        { from: "chloe", text: "i KNEW it" },
        { from: "chloe", text: "i mean i also knew it was a spirit. both things can be true. you pushed AND something wanted you to." },
        { from: "chloe", text: "did she push too. because the planchette fought. like two drivers." },
      ],
      choices: [
        { text: "yes. she was cheating. that's why i was angry.", next: "creek", flags: ["told_chloe_mandy_cheat"] },
        { text: "i don't want this in tropicana language. she just... wouldn't let go.", next: "creek" },
      ],
    },
    blame: {
      messages: [
        { from: "chloe", text: "i saw her knuckle. lo saw her knuckle. [[photo:ouija|it's IN the picture]]" },
        { from: "chloe", text: "if you caught her cheating why did you walk her toward the creek instead of yelling in the driveway like a normal person" },
        { from: "chloe", text: "normal people slam a door. they don't take the shortcut." },
      ],
      choices: [{ text: "I don't know.", next: "creek" }],
    },
    creek: {
      clues: [{ id: "chloe_creek", note: "Chloe already told adults the board spelled CREEK. She sent Tropicana pages like evidence." }],
      messages: [
        { from: "chloe", text: "[[wiki:creek|old mill creek]]  [[news:search|channel 7 is already saying the search moved there]]" },
        { from: "chloe", text: "carrie voss 1978. halloween. a board. a creek. i TOLD you last night and britt said i was doing a bit." },
        { from: "chloe", text: "if you took mandy that way you have to say. not to the board. to a person." },
      ],
      choices: [
        { text: "we might have cut that way.", next: "mom", flags: ["admitted_creek"] },
        { text: "stop making it a legend.", next: "mom" },
      ],
    },
    mom: {
      messages: [
        { from: "chloe", text: "the mom picture. [[photo:mom|IMG_004]]  i screamed because her eyes were coins and then everyone laughed and the laugh is in the next pictures like nothing happened." },
        { from: "chloe", text: "that was the last adult. we used sleeping bags as a LIE. [[photo:bags|IMG_003]]  then a boy came. then we asked a board who he'd marry. then someone didn't get home." },
        { from: "chloe", text: "i'm not saying you did something. i'm saying the night did something and you were holding the planchette when it did." },
      ],
      choices: [{ text: "I have to go.", next: "idle" }],
    },
    idle: {
      messages: [{ from: "sys", text: "darkstarchloe is compiling 'evidence' in a WordPad file named SPIRIT.doc" }],
      choices: [
        { text: "don't tell the cops about the board.", next: "mom" },
        { text: "i have to go.", exit: true },
      ],
    },
  },

  britt: {
    start: {
      flags: ["talked_britt"],
      clues: [{ id: "talked_britt", note: "Brittany thought Mandy was at Tyler's. She also saw you on Maple. She thought the photos were dumb until they weren't." }],
      messages: [
        { from: "britt", text: "this is so extra" },
        { from: "britt", text: "mandy is probably at tyler's eating captain crunch. her mom is dramatic. lo is dramatic. chloe is a community theater production of dramatic." },
        { from: "britt", text: "also lo keeps IMing me PICTURES like i want to do a scrapbook. i was THERE. i ate the pineapple pizza. [[photo:pizza|i know what pizza looks like]]" },
        { from: "britt", text: "...did she actually not come home though" },
      ],
      choices: [
        { text: "she didn't. it's on the news.", next: "news", flags: ["britt_saw_news"] },
        { text: "you saw us leave. don't pretend you didn't.", next: "maple" },
        { text: "the movie was dumb but the rest wasn't a bit.", next: "movie" },
      ],
    },
    news: {
      messages: [
        { from: "britt", text: "ok i opened it" },
        { from: "britt", text: "[[news:missing|that's her school picture]]  that's actually her. i hate that." },
        { from: "britt", text: "fine. what do you want me to say. i saw you guys on maple. you were pissed. she was talking with her hands." },
      ],
      choices: [{ text: "what did you hear.", next: "maple" }],
    },
    movie: {
      messages: [
        { from: "britt", text: "the movie was DUMB. hook man. pg-13 screams. mandy kept going 'it's about a secret' like she was in english class. [[photo:movie|IMG_002]]" },
        { from: "britt", text: "you want a secret? the sleeping bags were so her mom would leave. that's not witchcraft that's 10th grade. [[photo:bags|IMG_003]]" },
        { from: "britt", text: "then you got weird after the board. then you left with her. that's the whole recap without ghosts." },
      ],
      choices: [
        { text: "what did you hear on maple.", next: "maple" },
        { text: "did you see us after we passed the porch?", next: "maple" },
      ],
    },
    maple: {
      flags: ["britt_maple"],
      clues: [{ id: "fight_on_maple", note: "Brittany heard you fighting on Maple: 'I SAW you' / 'YOU were pushing it too.'" }],
      messages: [
        { from: "britt", text: "i was on jess's lawn putting my soccer bag in my brother's car because he was late and annoying." },
        { from: "britt", text: "you said I SAW YOU." },
        { from: "britt", text: "she said YOU WERE PUSHING IT TOO." },
        { from: "britt", text: "then you both went past the streetlight. lo's picture is from BEFORE that. [[photo:leaving|IMG_008]]  after that it's just dark and i'm not walking into the trees in socks." },
        { from: "britt", text: "if the cops ask i have to say that. i'm not getting in trouble for your ouija fight." },
      ],
      choices: [
        { text: "it wasn't a fight.", next: "idle", flags: ["minimized_fight"] },
        { text: "yeah. it was a fight.", next: "idle", flags: ["admitted_fight"] },
      ],
    },
    idle: {
      messages: [{ from: "britt", text: "don't IM me spooky stuff. if you need a ride or whatever. that's different." }],
      choices: [{ text: "thanks.", next: "idle2" }],
    },
    idle2: {
      messages: [{ from: "sys", text: "soccerbrit99 set her away message to 'this is so extra' again, weaker." }],
      exit: "ok.",
    },
    proof: {
      flags: ["britt_saw_proof"],
      messages: [
        { from: "britt", text: "lo just forwarded me a picture." },
        { from: "britt", text: "sarah that's you." },
        { from: "britt", photo: "proof", text: "[[photo:proof|5:14 AM]]  i've been on your driveway. that's your mailbox. that's your stupid jacket." },
        { from: "britt", text: "you were in a fight with her about the board and then you come home at DAWN looking like that?" },
        { from: "britt", text: "i'm going to have to tell them what i heard. i'm sorry. i'm not lying for a slumber party." },
      ],
      choices: [
        { text: "britt don't.", next: "cops" },
        { text: "it's not what it looks like.", next: "cops" },
      ],
    },
    cops: {
      messages: [
        { from: "britt", text: "it looks like you." },
        { from: "britt", text: "that's the whole problem." },
      ],
      exit: "...",
    },
  },

  tyler: {
    start: {
      flags: ["talked_tyler"],
      clues: [{ id: "talked_tyler", note: "Tyler came because Mandy IM'd him that Mrs. Hart was leaving. He left. He did not walk anyone home." }],
      messages: [
        { from: "tyler", text: "is this moonpixie98. mandy's friend" },
        { from: "tyler", text: "her mom called MY house. i'm freaking out. i didn't even go inside." },
        { from: "tyler", text: "there's a picture of me at the window??? tell doodles to eat that print. [[photo:window|IMG_006]] my dad will actually kill me" },
      ],
      choices: [
        { text: "why did you even come.", next: "why" },
        { text: "did you see us later. on maple.", next: "later" },
      ],
    },
    why: {
      messages: [
        { from: "tyler", text: "because mandy IM'd me at like 6 that jess's mom had a wedding and to come by the basement window like a movie." },
        { from: "tyler", text: "we talked for eight minutes. she said later. i left because a dog that wasn't mine didn't even exist and also i got scared. that's the whole cameo." },
        { from: "tyler", text: "the board stuff is insane. i wasn't there for the board. if she didn't get home that's not on a window." },
      ],
      choices: [{ text: "she didn't get home.", next: "later" }],
    },
    later: {
      messages: [
        { from: "tyler", text: "i was in bed. i didn't see maple. i didn't see a creek. i saw a window and a girl who said later." },
        { from: "tyler", text: "if lo has a picture from this morning of somebody walking around in the dark that's not me. i checked my shoes. they're dry." },
      ],
      choices: [{ text: "ok.", next: "idle" }],
    },
    idle: {
      messages: [{ from: "sys", text: "tytyb_11 is idle. his away message keeps changing." }],
      exit: "ok.",
    },
  },

  mandy: {
    start: {
      flags: ["opened_mandy"],
      messages: [
        { from: "sys", text: "xXMandyHeartsXx is offline. Last seen: Sat 10:22 PM." },
        { from: "sys", text: "Profile: brb going to jess's!! if tyler IMs me tell him i said hi ;)" },
        { from: "sys", text: "You can leave an offline message. It will sit there." },
      ],
      choices: [
        { text: "where are you", next: "offline", flags: ["wrote_mandy_where"] },
        { text: "i'm sorry", next: "offline", flags: ["wrote_mandy_sorry"] },
        { text: "don't tell anyone about the board", next: "offline", flags: ["wrote_mandy_dont"] },
      ],
    },
    offline: {
      messages: [
        { from: "sys", text: "Message queued. xXMandyHeartsXx has not signed on." },
      ],
      exit: "ok.",
    },
    ghost: {
      flags: ["mandy_signed_on"],
      messages: [
        { from: "sys", text: "xXMandyHeartsXx has signed on" },
        { from: "mandy", text: "you saw me" },
        { from: "mandy", text: "i saw you" },
        { from: "mandy", text: "you have the picture now" },
        { from: "sys", text: "xXMandyHeartsXx has signed off" },
      ],
      exit: "...",
    },
  },
};
