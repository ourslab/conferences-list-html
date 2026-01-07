 const conferences_list_columns = {
  name    : "学会名",
  apply   : "申込期限",
  abstract: "Abstract Deadline",
  paper   : "Paper Deadline",
  date    : "開会日時",
  venue   : "場所"
};

let conferences_list = [];

if (typeof(conferences_list) !== 'undefined') conferences_list.push({
  type    : "international", // "international" or "domestic"
  name    : {text: "FPT 2025 (conference track)", url: "https://fpt2025.shanghaitech.edu.cn/"},
  apply   : {date: {year: 2025, month: 7, day: 20}},
  abstract: {date: {year: 2025, month: 7, day: 20}},
  paper   : {date: {year: 2025, month: 8, day: 1}},
  date    : {date: {year: 2025, month: 12, day: 2}},
  venue   : {text: "Shanghai"}
});

if (typeof(conferences_list) !== 'undefined') conferences_list.push({
  type    : "domestic", // "international" or "domestic"
  name    : {text: "DesignGaia 2025", url: "https://www.ieice.org/iss/reconf/top/"},
  apply   : {date: {year: 2025, month: 9, day: 3}},
  abstract: {},
  paper   : {date: {year: 2025, month: 10, day: 0}},
  date    : {date: {year: 2025, month: 12, day: 1}},
  venue   : {text: "富山県"}
});
