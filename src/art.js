export const icon = (name, size = 24) => {
  const paths = {
    bolt: '<path d="m13 2-8 12h6l-1 8 9-13h-7l1-7Z"/>',
    play: '<path d="m9 5 11 7-11 7V5Z"/>',
    home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
    trophy:
      '<path d="M7 3h10v6a5 5 0 0 1-10 0V3Zm5 11v5m-4 2h8M7 5H3v3a4 4 0 0 0 5 4m9-7h4v3a4 4 0 0 1-5 4"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .5-1.5 1-1.5 2m0 3h.01"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    up: '<path d="m6 14 6-6 6 6"/>',
    down: '<path d="m6 10 6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    volume:
      '<path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    pliers:
      '<path d="m8 3 1 5 3 3 3-3 1-5m-7 5 6 12m0-12L9 20M7 2l-2 5 4 3m8-8 2 5-4 3"/><circle cx="12" cy="11" r="2"/>',
    gloves:
      '<path d="M7 13V6a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-6a1.5 1.5 0 0 1 3 0v7-4a1.5 1.5 0 0 1 3 0v8c0 4-3 6-6 6h-1c-2 0-4-1-5-3l-3-5c-1-2 1-3 2-2l1 1Z"/>',
    leaf: '<path d="M20 3C9 2 3 6 4 13s10 10 14 2c2-4 1-8 2-12ZM4 21 15 9"/>',
    spark:
      '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
    flag: '<path d="M5 22V3m0 0c5-4 9 4 15 0v11c-6 4-10-4-15 0"/>',
    refresh:
      '<path d="M20 7v5h-5M4 17v-5h5m-4-5a8 8 0 0 1 13-2l2 3M4 16l2 3a8 8 0 0 0 13-2"/>',
    bed: '<path d="M3 18V7m0 7h18v6m-18-2h18M6 14V9h5v5m0-4h7a3 3 0 0 1 3 3v1"/>',
    dining:
      '<path d="M6 3v7m-3-7v5a3 3 0 0 0 6 0V3M6 11v11M18 3c-4 3-4 8 0 8V3Zm0 8v11"/>',
    sofa: '<path d="M5 10V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3M5 14h14m-14-4a2 2 0 0 0-3 2v6h20v-6a2 2 0 0 0-3-2v4H5v-4Zm0 8v3m14-3v3"/>',
    bag: '<rect x="3" y="8" width="18" height="13" rx="3"/><path d="M8 8V5a4 4 0 0 1 8 0v3m-7 6h6m-3-3v6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 10v7m0-10h.01"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.bolt}</svg>`;
};

const plant = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="6" rx="28" ry="9" fill="#294d3f" opacity=".09"/><path d="M-16-21h32L11 6h-22Z" fill="#c98c69"/><path d="M-19-24h38v8h-38Z" fill="#dfaa7d"/><path d="M0-21V-80M0-45c-35-4-31-32-31-32C-4-79-1-54 0-45Zm0-16c32-6 28-32 28-32C1-91 0-72 0-61Zm0 30c-27-2-28-22-28-22C-4-56-1-41 0-31Zm0-8c26-3 30-26 30-26C5-69 1-50 0-39Z" fill="#488568" stroke="#387456" stroke-width="2"/></g>`;

export function outsideArt() {
  return `<svg class="room-art outside-art" viewBox="0 0 900 600" role="img" aria-label="An illustrated mint-green three-storey home with a front garden and an outdoor tool station">
  <defs>
    <linearGradient id="sky" x2="0" y2="1"><stop stop-color="#e8f1e6"/><stop offset="1" stop-color="#dae9d7"/></linearGradient>
    <linearGradient id="housewall" x2="0" y2="1"><stop stop-color="#fcf9e9"/><stop offset="1" stop-color="#ebe8d5"/></linearGradient>
    <pattern id="rooflines" width="24" height="18" patternUnits="userSpaceOnUse"><path d="M0 17h24M12 0v17" stroke="#55796b" stroke-width="1" fill="none" opacity=".3"/></pattern>
    <pattern id="grass" width="52" height="43" patternUnits="userSpaceOnUse"><path d="m4 35 2-4 2 4m30-17 2-4 2 4" fill="none" stroke="#a6bf99" stroke-width="1.5" opacity=".4"/></pattern>
    <filter id="shadow"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <path d="M0 0h900v600H0Z" fill="url(#sky)"/>
  <circle cx="721" cy="111" r="47" fill="#f9ecc2" opacity=".95"/>
  <g fill="#fffdf1" opacity=".75"><path d="M100 110c-7-19 10-33 26-24 0-23 39-26 43-1 24-9 38 14 23 25Z"/><path d="M570 66c-5-13 6-23 19-17 0-17 28-18 32-1 16-7 27 11 16 18Z"/><path d="M785 190c-6-15 7-26 21-20 0-18 31-19 35-1 18-7 30 12 18 21Z"/></g>
  <path d="M0 363q100-62 210-5t250-8 250 4 190 2v244H0Z" fill="#c4d4b5"/><path d="M0 409q161-49 303-1t324-6 273 2v196H0Z" fill="#baceaa"/>
  <path d="M0 410h900v190H0Z" fill="url(#grass)"/>
  <ellipse cx="511" cy="503" rx="244" ry="37" fill="#738e72" opacity=".2" filter="url(#shadow)"/>
  <g transform="translate(42 4)">
  <path d="m270 450 145-41 224 24 77 64-271 41Z" fill="#acbba0" opacity=".5"/>
  <path d="M292 183 469 90 651 182v276l-182 57-177-51Z" fill="#d4dbc4"/>
  <path d="M469 177 651 182v276l-182 57Z" fill="#d2d9c4"/>
  <path d="M292 183h270v279H292Z" fill="url(#housewall)"/>
  <path d="M562 183 651 227v231l-89 26Z" fill="#d3ddc9"/>
  <path d="M275 190 414 86h110L664 217 562 202 414 109 290 202Z" fill="#3d6557"/>
  <path d="M414 86h110L664 217 562 202Z" fill="#638475"/>
  <path d="M414 86h110L664 217 562 202Z" fill="url(#rooflines)"/>
  <path d="m414 109 112 81H305Z" fill="#e8e8d7"/>
  <path d="m282 198 132-101 120 90" fill="none" stroke="#e8e9d9" stroke-width="11" stroke-linejoin="round"/>
  <path d="M307 282h255M307 371h255" stroke="#d7d6c3" stroke-width="8"/>
  <path d="M562 282 651 306m-89 65 89 17" stroke="#bdcbb6" stroke-width="8"/>
  <path d="M588 153v-58l30 5v81Z" fill="#cc967c"/><path d="m584 92 37 6v11l-37-5Z" fill="#dca98a"/>
  <g fill="#6d9c92" stroke="#fbf8e7" stroke-width="7">
    <path d="M325 213h65v50h-65Zm103 0h65v50h-65ZM325 304h65v50h-65Zm103 0h65v50h-65ZM325 395h56v53h-56Z"/>
  </g>
  <g fill="#c7dfcf"><path d="M330 217h25v17h-25Zm103 0h25v17h-25ZM330 308h25v17h-25Zm103 0h25v17h-25ZM330 399h22v18h-22Z"/></g>
  <g stroke="#f5f3e1" stroke-width="4"><path d="M358 214v48m-31-24h62m72-24v48m-32-24h63M358 305v48m-31-24h62m72-24v48m-32-24h63M353 396v51m-26-25h51"/></g>
  <g fill="#b9d3bd" stroke="#e9edda" stroke-width="5"><path d="m586 243 38 13v43l-38-11Zm0 89 38 10v43l-38-9Z"/></g>
  <path d="M422 399q0-32 29-32t29 32v63h-58Z" fill="#bc775b" stroke="#f7f3de" stroke-width="7"/><path d="M432 395q0-17 18-17t18 17v12h-36Z" fill="#7eaa9b"/><path d="M449 416v39" stroke="#a4654c" stroke-width="2"/><circle cx="466" cy="432" r="3" fill="#f2db9b"/>
  <path d="M409 461h83v12h-83Zm-9 12h101v10H400Z" fill="#b9b8a4"/><path d="M400 473h101v5H400Z" fill="#d9d8c4"/>
  <path d="m334 466 181 1 18 17-191 1Z" fill="#d3d4be"/>
  <path d="m411 488 75 1 39 71-107 13-72-10Z" fill="#e9e3c9"/><path d="m400 515 100-2m-115 24 127-2m-151 21 159-2" stroke="#cccfb7" stroke-width="2"/>
  <g fill="#71976e"><ellipse cx="293" cy="448" rx="35" ry="25"/><ellipse cx="269" cy="455" rx="31" ry="21"/><ellipse cx="546" cy="459" rx="35" ry="28"/><ellipse cx="574" cy="464" rx="31" ry="21"/></g>
  <g fill="#e6d497"><circle cx="283" cy="437" r="4"/><circle cx="300" cy="450" r="3"/><circle cx="555" cy="450" r="4"/><circle cx="573" cy="464" r="3"/></g>
  </g>
  <g transform="translate(125 342)"><path d="M-7 88V-29H7V88Z" fill="#9a795b"/><path d="M-2-24c-64 24-73-41-42-58-27-31 6-73 37-61 30-36 71 0 59 27 43 9 32 65 1 64 10 32-25 48-55 28Z" fill="#6f9874"/><path d="m0 36-25-31M0 12l25-29" fill="none" stroke="#8c7958" stroke-width="5"/><path d="M-6 88h13" stroke="#9a795b" stroke-width="5"/></g>
  <g transform="translate(765 405)"><path d="M-5 65V-33H5v98Z" fill="#9b805d"/><path d="M0-20c-43 16-66-27-40-50-21-28 13-60 36-44 28-24 57 6 44 28 32 15 19 61-12 56-2 13-11 16-28 10Z" fill="#85a47b"/></g>
  <g stroke="#e8e9d1" stroke-width="7"><path d="M0 464h158m-146-18v51m28-51v51m28-51v51m28-51v51m28-51v51m28-51v51M741 486h159m-148-20v48m29-48v48m29-48v48m29-48v48m29-48v48m29-48v48"/></g>
  <g transform="translate(218 462)"><path d="M-7 6h14v52H-7Z" fill="#94775a"/><path d="M-31-4q0-28 29-28h24v38h-53Z" fill="#5f8170"/><path d="M-2-32q25-2 25 26v12H-2Z" fill="#789582"/><path d="M7-14h20" stroke="#edc382" stroke-width="4"/><path d="M27-28v22" stroke="#c77658" stroke-width="4"/></g>
  <g transform="translate(667 513)"><ellipse rx="48" ry="12" fill="#aabd9e"/><path d="M-35-31h64v30h-64Z" fill="#b6865e"/><path d="M-39-39h72v11h-72Z" fill="#dfb47d"/><path d="M-27 0v14m48-14v14" stroke="#8c6e51" stroke-width="6"/><path d="m-23-39 5-14 9 2-3 12m17 0-3-20 10-2 7 22" fill="#5c7d69"/><rect x="-4" y="-59" width="22" height="8" rx="2" fill="#e3ca8e"/></g>
  ${plant(844, 547, 0.65)}
  <g fill="#f4f2d7"><circle cx="107" cy="519" r="3"/><circle cx="117" cy="524" r="3"/><circle cx="798" cy="551" r="3"/></g>
  </svg>`;
}

export function roomArt(room) {
  const colors = {
    living: ["#e5e9dc", "#e0e3d1", "#cbd4bf", "#d5bd96", "#c5aa82"],
    dining: ["#ece4d6", "#f0e8d8", "#d8ceb7", "#c2b39b", "#aa9b83"],
    bedroom: ["#e3e5eb", "#e1e1e8", "#c2c9d5", "#c6baa5", "#b3a78e"],
  }[room];
  const [bg, back, side, floor, edge] = colors;
  const isLiving = room === "living";
  return `<svg class="room-art" viewBox="0 0 900 600" role="img" aria-label="A cutaway view of the ${room === "living" ? "living room" : room === "dining" ? "dining room" : "bedroom"} with furniture and appliances">
    <defs><pattern id="planks-${room}" width="150" height="33" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)"><path d="M0 0h150v33H0Z" fill="${floor}"/><path d="M0 0h150M0 0v33" stroke="${edge}" stroke-width="1" opacity=".5"/></pattern></defs>
    <path d="M0 0h900v600H0Z" fill="${bg}"/>
    <ellipse cx="450" cy="516" rx="355" ry="24" fill="#294d3d" opacity=".08"/>
    <path d="M155 142h533v254H155Z" fill="${back}"/>
    <path d="m76 221 79-79v254l-79 85Z" fill="${side}"/>
    <path d="m688 142 125 80v259l-125-85Z" fill="${side}"/>
    <path d="M155 396h533l125 85H76Z" fill="url(#planks-${room})"/>
    <path d="M76 481h737v18H76Z" fill="${edge}"/>
    <path d="M155 383h533v13H155Zm-79 84 79-84v13l-79 85Zm612-84 125 84v14l-125-85Z" fill="#f8f4e5"/>
    <path d="M155 142h533m-612 79 79-79m533 0 125 80" fill="none" stroke="#faf8ed" stroke-width="12" stroke-linejoin="round"/>
    <path d="M76 221v260m737-259v259" stroke="#e9e5d5" stroke-width="11"/>
    <g transform="translate(373 185)"><path d="M-9-9h134v127H-9Z" fill="#c6c5b2" opacity=".4"/><path d="M0 0h116v108H0Z" fill="#faf6e8"/><path d="M8 8h100v89H8Z" fill="${room === "bedroom" ? "#a2b8bf" : "#b4cebf"}"/><path d="M8 77q25-32 52-8t48-13v41H8Z" fill="#8fad94" opacity=".7"/><path d="M57 8v89M8 52h100" stroke="#f6f1de" stroke-width="6"/><path d="M-8 108h132v8H-8Z" fill="#faf6e8"/>
    <path d="M-23-8h162" stroke="#a58c6e" stroke-width="5"/>
    <path d="M-19-4H9L1 102h-27Z" fill="${isLiving ? "#c99675" : room === "dining" ? "#b7bb8e" : "#a6acc4"}"/><path d="M107-4h28l7 106h-27Z" fill="${isLiving ? "#c99675" : room === "dining" ? "#b7bb8e" : "#a6acc4"}"/>
    <path d="m-11 0-6 92m143-92 7 92" stroke="#fff" opacity=".15" stroke-width="3"/></g>
    <g transform="translate(257 212)"><rect x="-20" y="-26" width="43" height="56" rx="1" fill="#b69b75"/><path d="M-15-21h33v46h-33Z" fill="#f4eddb"/><path d="M-10 18 2-7 12 18Z" fill="#94ab85"/><circle cx="10" cy="-12" r="6" fill="#d6b677"/></g>
    <g transform="translate(319 211)"><circle r="23" fill="#8f9d87"/><circle r="19" fill="#f8f3df"/><path d="M0-12V0l9 5" fill="none" stroke="#62735d" stroke-width="2.5" stroke-linecap="round"/><circle r="2" fill="#62735d"/></g>
    ${room === "living" ? livingFurniture() : room === "dining" ? diningFurniture() : bedroomFurniture()}
    ${plant(735, 423, 0.65)}
    <path d="M77 482h736" stroke="#ece6d4" stroke-width="3"/>
  </svg>`;
}

function livingFurniture() {
  return `<path d="m278 415 270 0 69 42H219Z" fill="#ede2bc"/><path d="m289 424 245 0 35 22H254Z" fill="none" stroke="#ccbb8e" stroke-width="2"/>
  <g transform="translate(303 360)"><ellipse cx="102" cy="66" rx="127" ry="14" fill="#806d52" opacity=".13"/><path d="M-15 13q0-28 24-28h173q24 0 24 28v36H-15Z" fill="#759180"/><rect x="-8" y="-7" width="104" height="43" rx="12" fill="#8ba490"/><rect x="100" y="-7" width="98" height="43" rx="12" fill="#8ba490"/><rect x="-15" y="27" width="221" height="28" rx="7" fill="#789782"/><path d="M-24 8q0-9 10-9h9q9 0 9 9v40h-28Zm212 0q0-9 9-9h9q10 0 10 9v40h-28Z" fill="#9bb09a"/><path d="M-6 55v12m194-12v12" stroke="#806c51" stroke-width="7"/><path d="m23-6 32-4 8 30-32 5Z" fill="#e1bb85"/><path d="m131-3 29 4-5 26-29-4Z" fill="#c9d4b7"/></g>
  <g transform="translate(454 454)"><ellipse cx="0" cy="-3" rx="50" ry="16" fill="#b29164"/><path d="M-42-1v20m78-20v20" stroke="#9d7d55" stroke-width="5"/><ellipse cy="-7" rx="50" ry="16" fill="#d7bc8c"/><path d="m-12-15 22 0 9 7-23 1Z" fill="#e8ecda"/><ellipse cx="25" cy="-10" rx="7" ry="3" fill="#d3a070"/><path d="M19-10v8q6 5 12 0v-8" fill="#eddbb4"/></g>
  <path d="M176 353h91v9h-91Zm6 9v35m77-35v35" fill="#b59b75" stroke="#b59b75" stroke-width="5"/>
  <path d="M561 354h108v43H561Z" fill="#bba17a"/><path d="M556 349h118v9H556Z" fill="#d7c19b"/><path d="M568 365h94v23h-94Z" fill="#cbb38d"/><path d="M610 375h10" stroke="#a48c65" stroke-width="2"/>`;
}

function diningFurniture() {
  return `<path d="M174 347h170v48H174Z" fill="#c3aa7c"/><path d="M170 341h178v10H170Z" fill="#f4ead2"/><path d="M230 351v41m57-41v41" stroke="#a48d67" stroke-width="2"/><path d="M214 366h7m51 0h7m51 0h7" stroke="#806f53" stroke-width="3"/>
  <path d="M561 354h108v43H561Z" fill="#c3aa7c"/><path d="M556 349h118v9H556Z" fill="#f4ead2"/><path d="M613 358v35" stroke="#a48d67" stroke-width="2"/><path d="M599 370h7m18 0h7" stroke="#806f53" stroke-width="3"/>
  <path d="m343 418 189 0 76 47H282Z" fill="#d6d4b4"/>
  <g transform="translate(422 390)"><path d="M-61-8v67m130-67v67" stroke="#977d54" stroke-width="9"/><path d="M-93-22h171l44 36H-119Z" fill="#d8b587"/><path d="M-119 14h241v10h-241Z" fill="#b99569"/><path d="M-96-19h174l32 26h-222Z" fill="#dfc397"/>
  <ellipse cx="-52" cy="-6" rx="19" ry="8" fill="#f5f0dc"/><ellipse cx="55" cy="-6" rx="19" ry="8" fill="#f5f0dc"/><ellipse cx="4" cy="-7" rx="17" ry="7" fill="#9ba97f"/><path d="M-8-14v-20h22v20q-11 11-22 0Z" fill="#e2c698"/><path d="M2-34v-22m0 14-12-10m12 5 11-12" stroke="#8d9f74" stroke-width="4"/></g>
  <g fill="#9a8260" stroke="#806b50" stroke-width="4"><path d="M306 395v-39h39v39m-37 12v39m35-39v39M531 395v-39h39v39m-37 12v39m35-39v39"/></g>
  <path d="M301 392h49v15h-49Zm225 0h49v15h-49Z" fill="#b6a17b"/>`;
}

function bedroomFurniture() {
  return `<path d="m268 417 279 0 67 47H215Z" fill="#d5d4da"/><path d="m290 425 240 0 39 29H251Z" fill="none" stroke="#b8b6c5" stroke-width="2"/>
  <g transform="translate(362 334)"><path d="M-48-11h169q11 0 11 11v66H-59V0q0-11 11-11Z" fill="#b99a7c"/><path d="M-50-3h174v52H-50Z" fill="#d0b495"/><path d="m-57 51-39 68h265l-37-68Z" fill="#ad9176"/><path d="m-52 33-38 71h252l-35-71Z" fill="#f3efdf"/><path d="m-39 56-39 51h229l-29-51Z" fill="#9da9ba"/><path d="m-31 56-35 45h206l-27-45Z" fill="#adb7c7"/><path d="M-69 94h219v19H-80Z" fill="#8998af"/><path d="M-77 116v13m234-13v13" stroke="#92765a" stroke-width="7"/><path d="m-27 39-9 18h57l5-18Z" fill="#fff9e9"/><path d="m54 39 4 18h57l-9-18Z" fill="#fff9e9"/><path d="m31 64 4 42h29l-5-42Z" fill="#d6bd96"/></g>
  <path d="M201 358h73v43h-73Z" fill="#c6a884"/><path d="M196 352h83v9h-83Z" fill="#dec6a4"/><path d="M207 365h61v14h-61Zm0 18h61v14h-61Z" fill="#d2b791"/><path d="M233 371h9m-9 18h9" stroke="#9a7f60" stroke-width="2"/>
  <path d="M573 354h96v40h-96Z" fill="#c6a884"/><path d="M568 348h106v10H568Z" fill="#dec6a4"/><path d="M582 366h78v19h-78Z" fill="#d2b791"/><path d="M616 374h11" stroke="#9a7f60" stroke-width="2"/>`;
}

export const SLOT_POSITIONS = [
  [223, 350],
  [606, 354],
  [688, 435],
  [183, 437],
  [575, 445],
  [330, 464],
];

export function appliancePosition(item) {
  const [x, y] = SLOT_POSITIONS[item.slot];
  if (item.kind === "ac" && item.slot < 3) {
    return [
      [222, 263],
      [607, 272],
      [733, 338],
    ][item.slot];
  }
  if (["fan", "fridge", "purifier"].includes(item.kind) && item.slot < 2) {
    return [item.slot === 0 ? 185 : 637, 415];
  }
  return [x, y];
}

export function applianceArt(kind) {
  const wrap = (art) =>
    `<svg viewBox="0 0 100 110" class="appliance-drawing" aria-hidden="true"><ellipse cx="50" cy="100" rx="37" ry="7" fill="#38513d" opacity=".12"/>${art}</svg>`;
  const art = {
    tv: '<path d="M9 30h78v53H9Z" fill="#9c8c72"/><path d="M6 24h78v54H6Z" fill="#344d47"/><path d="M11 29h68v43H11Z" fill="#779b91"/><path d="m13 68 29-37h34L43 69Z" fill="#9fbbb0" opacity=".55"/><path d="M41 78v12m-14 2h37" stroke="#344d47" stroke-width="5"/><path d="M3 94h87v8H3Z" fill="#c0a47b"/>',
    fan: '<path d="M47 55v40" stroke="#688375" stroke-width="6"/><ellipse cx="47" cy="98" rx="25" ry="6" fill="#7a9281"/><circle cx="47" cy="37" r="31" fill="#e1e5cf" stroke="#7a9281" stroke-width="3"/><g fill="#91aa93"><path d="M47 37C13 42 18 14 31 17c14 2 16 20 16 20Zm0 0c11-32 33-16 25-7-9 12-25 7-25 7Zm0 0c23 25-1 37-8 26-8-13 8-26 8-26Z"/></g><g fill="none" stroke="#839c84" opacity=".6"><circle cx="47" cy="37" r="24"/><circle cx="47" cy="37" r="15"/><path d="M47 6v62M16 37h62M25 15l44 44M25 59l44-44"/></g><circle cx="47" cy="37" r="5" fill="#6f8f79"/>',
    lamp: '<ellipse cx="48" cy="99" rx="24" ry="5" fill="#7b795f"/><path d="M48 44v52" stroke="#a68b60" stroke-width="5"/><path d="M30 14h36l14 35H17Z" fill="#edce91"/><ellipse cx="48" cy="49" rx="31" ry="5" fill="#dcc08a"/><path d="M32 17h4L26 45h-4Z" fill="#f7dfad"/><path d="m70 46 0 15" stroke="#8e7c59" stroke-width="1.5"/>',
    ac: '<path d="M5 38h88v39H5Z" fill="#aebbad"/><path d="M2 30h88v42H2Z" fill="#f1efde"/><path d="M8 37h75v5H8Z" fill="#d7ddce"/><path d="M8 57h75v10H8Z" fill="#a1b5a5"/><path d="M11 60h68m-68 4h68" stroke="#6f8c7b"/><circle cx="79" cy="48" r="2" fill="#86ae6e"/><path d="M22 79q-8 7 0 13m23-13q-8 7 0 13m23-13q-8 7 0 13" stroke="#b4cec0" stroke-width="2" fill="none"/>',
    radio:
      '<rect x="12" y="47" width="77" height="49" rx="7" fill="#bb9670"/><path d="M12 66h77v19H12Z" fill="#b08b68"/><circle cx="36" cy="72" r="18" fill="#465e51"/><circle cx="36" cy="72" r="13" fill="#6a7c63"/><path d="M62 58h18v7H62Z" fill="#e7d7aa"/><circle cx="66" cy="78" r="4" fill="#ecdbb2"/><circle cx="79" cy="78" r="4" fill="#ecdbb2"/><path d="M27 47V33h41v14" stroke="#725d46" stroke-width="4" fill="none"/><path d="m77 46 7-34" stroke="#687361" stroke-width="2"/>',
    purifier:
      '<rect x="24" y="24" width="50" height="75" rx="13" fill="#f4efdd"/><path d="M33 38h32m-32 5h32m-32 5h32m-32 5h32m-32 5h32m-32 5h32" stroke="#b7c4af" stroke-width="2"/><circle cx="49" cy="82" r="6" fill="#dce5c5"/><path d="M42 29h14" stroke="#8ca880" stroke-width="2"/>',
    fridge:
      '<path d="M23 6h54v94H23Z" fill="#9fb4a1"/><rect x="17" y="3" width="54" height="97" rx="5" fill="#d0dfcc"/><path d="M18 34h52" stroke="#9eb69e" stroke-width="2"/><path d="M25 16v10m0 21v24" stroke="#6f8e78" stroke-width="4" stroke-linecap="round"/><path d="M31 52h15v18H31Z" fill="#f1e5b5"/><path d="m34 59 4 4 5-8" stroke="#bf9b61" stroke-width="2" fill="none"/><path d="M27 100v4m34-4v4" stroke="#7b8f77" stroke-width="4"/>',
    microwave:
      '<path d="M5 50h86v47H5Z" fill="#9baaa0"/><rect x="3" y="45" width="83" height="49" rx="4" fill="#e7e8d7"/><rect x="10" y="52" width="54" height="34" rx="2" fill="#496159"/><path d="M15 57h43v22H15Z" fill="#68877a"/><ellipse cx="36" cy="77" rx="17" ry="3" fill="#9db5a2"/><path d="M69 52h11v8H69Z" fill="#7c9b7f"/><circle cx="75" cy="72" r="5" fill="#b5c4ae"/><circle cx="75" cy="84" r="3" fill="#7a8d78"/>',
    kettle:
      '<ellipse cx="49" cy="98" rx="31" ry="5" fill="#7b8d74"/><path d="M67 51q29-9 20 20-4 12-17 8" fill="none" stroke="#677e6b" stroke-width="8"/><path d="M28 46h34l11 42q2 9-11 9H29q-12 0-10-9Z" fill="#b5cba8"/><path d="m26 51-15-7 7 26 6 3" fill="#a4bc98"/><path d="M30 43h31v7H30Z" fill="#718e74"/><path d="M41 39h9v5h-9Z" fill="#6d846c"/><path d="M33 59v22" stroke="#d3e0be" stroke-width="5" stroke-linecap="round"/>',
    toaster:
      '<path d="M17 63q0-17 18-17h33q17 0 17 17v30H17Z" fill="#c9b18d"/><path d="M12 60q0-17 18-17h33q17 0 17 17v33H12Z" fill="#e2ceb0"/><path d="M23 48h43" stroke="#7e7159" stroke-width="5" stroke-linecap="round"/><path d="M27 46V30q0-10 16-10t16 10v16Z" fill="#c99d62"/><path d="M32 43V32q0-7 11-7t11 7v11Z" fill="#e8c68e"/><path d="M68 64v18" stroke="#aa906a" stroke-width="3"/><path d="M63 71h10" stroke="#6f795f" stroke-width="3"/>',
    blender:
      '<path d="M29 79h42l7 20H22Z" fill="#94b49b"/><path d="M32 76 25 28h42l-5 48Z" fill="#cee2ca" stroke="#91b29a" stroke-width="2"/><path d="M28 48h36l-4 23H32Z" fill="#d8b77e"/><path d="M67 34q22-4 16 16-3 10-18 7" fill="none" stroke="#8eaf99" stroke-width="5"/><path d="M24 23h45v7H24Z" fill="#7b9f86"/><path d="M39 18h17v6H39Z" fill="#7b9f86"/><circle cx="49" cy="90" r="5" fill="#e8e6ca"/>',
    rice: '<path d="M20 56h60v30q0 14-30 14T20 86Z" fill="#e5e6d3"/><ellipse cx="50" cy="56" rx="30" ry="12" fill="#b7cbb0"/><path d="M24 53q1-16 26-16t26 16Z" fill="#d7dfc7"/><path d="M41 34h18v7H41Z" fill="#819b7b"/><path d="M19 65H9v12h11m60-12h11v12H80" fill="none" stroke="#799175" stroke-width="6"/><rect x="37" y="71" width="26" height="17" rx="3" fill="#b0c5a2"/><circle cx="50" cy="79" r="3" fill="#f1d197"/>',
    laptop:
      '<path d="M19 38h61v44H19Z" fill="#6e807c"/><path d="M23 42h53v35H23Z" fill="#a1bbbc"/><path d="m25 75 28-31h20L45 75Z" fill="#b9ced0"/><path d="m19 82-13 14h88L80 82Z" fill="#b8c3bb"/><path d="M6 96h88v4H6Z" fill="#82968a"/><path d="M39 91h22" stroke="#82968a" stroke-width="3"/>',
    console:
      '<rect x="11" y="43" width="77" height="54" rx="8" fill="#e2e6d3"/><rect x="28" y="48" width="42" height="43" rx="3" fill="#415d54"/><path d="M33 54h32v30H33Z" fill="#8baa94"/><path d="M17 62h7m-3-4v8" stroke="#7d9d86" stroke-width="2"/><circle cx="79" cy="64" r="3" fill="#a1b596"/><circle cx="75" cy="73" r="3" fill="#a1b596"/><circle cx="22" cy="82" r="4" fill="#8da889"/>',
    iron: '<path d="M17 87q1-25 41-38l29 38Z" fill="#d3ddc7"/><path d="M17 87h70v8H17Z" fill="#899d8c"/><path d="M44 57q-2-25 26-17l11 22" fill="none" stroke="#6e8c76" stroke-width="7"/><path d="M82 54q25-27 13-39" fill="none" stroke="#6d7b65" stroke-width="2"/><path d="M33 78h32" stroke="#afc1a7" stroke-width="3"/>',
  };
  return wrap(art[kind] || art.radio);
}
