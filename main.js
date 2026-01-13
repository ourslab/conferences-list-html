const conferences_list_columns_key = Object.keys(conferences_list_columns);
const conferences_list_columns_value = Object.values(conferences_list_columns);

let conferences_list_international = [];
let conferences_list_domestic = [];

let timestamp_today = new Date();
timestamp_today.setHours(0, 0, 0, 0);

let timestamp_display_oldest = new Date();
timestamp_display_oldest.setFullYear(timestamp_display_oldest.getFullYear() - 1);
timestamp_display_oldest.setHours(0, 0, 0, 0);

function conferences_list_load_from_table(dom) {
  const rows = dom.children[0].children[0].children;
  if (rows.length < 2) {
    return [];
  }
  let columns = rows[0].children[0].children;
  for (let a = 0; a < columns.length; a++) {
    columns[a] = columns[a].innerHTML.split(" ");
    if (columns[a].length == 1) {
      columns[a].push("");
    }
  }
  let list = [];
  for (let a = 1; a < rows.length; a++) {
    let data = {};
    for (let b = 0; b < columns.length; b++) {
      if (columns[b][0] == 'url') {
        data['name'][columns[b][0]] = rows[a].children[0].children[b];
      } else if (columns[b][1] == 'text') {
        data[columns[b][0]][columns[b][1]] = rows[a].children[0].children[b];
      } else if (columns[b][1] == 'date') {
        let date = rows[a].children[0].children[b].split("/");
        date[0] = (date.length > 0)? parseInt(date[0]) : 0;
        date[1] = (date.length > 1)? parseInt(date[1]) : 0;
        date[2] = (date.length > 2)? parseInt(date[2]) : 0;
        data['date']['year'] = date[0];
        data['date']['month'] = date[1];
        data['date']['day'] = date[2];
      } else {
        data[columns[b][0]] = rows[a].children[0].children[b];
      }
    }
    list.push(data);
  }
  return list;
}

function conferences_list_update_timestamp(list, key, reset=false) {
  for (let a = 0; a < list.length; a++) {
    let record_timestamp;
    if (reset) {
      record_timestamp = timestamp_today;
    } else {
      record_timestamp = list[a]['timestamp'];
    }
    if (typeof(list[a][key]) !== 'undefined') {
      if (typeof(list[a][key]['date']) !== 'undefined') {
        const record_date = list[a][key]['date'];
        let timestamp_year = (typeof(record_date['year']) === 'undefined' || record_date['year'] == 0)? timestamp_today.getFullYear() : record_date['year'];
        let timestamp_month = (typeof(record_date['month']) === 'undefined' || record_date['month'] == 0)? timestamp_today.getMonth() : record_date['month'] - 1;
        let timestamp_day = (typeof(record_date['day']) === 'undefined' || record_date['day'] == 0)? timestamp_today.getDay() : record_date['day'];
        let timestamp = new Date(timestamp_year, timestamp_month, timestamp_day);
        if (record_timestamp == timestamp_today) {
          record_timestamp = timestamp;
        } else if (timestamp < record_timestamp) {
          record_timestamp = timestamp;
        }
      }
    }
    list[a]['timestamp'] = record_timestamp;
  }
}

function conferences_list_sort(list, sort) {
  if (sort == "deadline") {
    conferences_list_update_timestamp(list, 'apply', true);
    conferences_list_update_timestamp(list, 'abstract');
    conferences_list_update_timestamp(list, 'paper');
  } else {
    conferences_list_update_timestamp(list, sort, true);
  }
  let tags_displayed = {};
  let tags_not_displayed = {};
  let list_sorted = [];
  for (let a = 0; a < list.length; a++) {
    let tag = (typeof(list[a]['tag']) !== 'undefined')? list[a]['tag'] : false;
    if (list[a]['timestamp'] < timestamp_display_oldest) {
      if (tag) {
        tags_not_displayed[tag] = true;
      }
      continue;
    } else {
      if (list[a]['timestamp'] < timestamp_today) {
        list[a]['closed'] = "";
      }
      if (tag) {
        tags_displayed[tag] = true;
      }
    }
    let b = 0;
    while (b < list_sorted.length) {
      if (list[a]['timestamp'] < list_sorted[b]['timestamp']) {
        break;
      }
      b++;
    }
    list_sorted.splice(b, 0, list[a]);
  }
  tags_displayed = Object.keys(tags_displayed);
  tags_not_displayed = Object.keys(tags_not_displayed);
  for (let a = 0; a < tags_not_displayed.length; a++) {
    let tag_exist = false;
    for (let b = 0; b < tags_displayed.length; b++) {
      if (tags_not_displayed[a] == tags_displayed[b]) {
        tag_exist = true;
      }
    }
    if (!tag_exist) {
      console.warn(`Tag: ${tags_not_displayed[a]} missed!`);
    }
  }
  return list_sorted;
}

function conferences_list_display(dom, list, sort) {
  dom.innerHTML = "";
  const list_sorted = conferences_list_sort(list, sort);
  const table = document.createElement("table");
  table.className = "conferences-list";
  const tbody = document.createElement("tbody");
  const tr = document.createElement("tr");
  for (let a = 0; a < conferences_list_columns_key.length; a++) {
    let is_sort_target = false;
    if (sort == "deadline") {
      if (conferences_list_columns_key[a] == "apply") {
        is_sort_target = true;
      } else if (conferences_list_columns_key[a] == "abstract") {
        is_sort_target = true;
      } else if (conferences_list_columns_key[a] == "paper") {
        is_sort_target = true;
      }
    } else if (conferences_list_columns_key[a] == sort) {
      is_sort_target = true;
    }
    const td = document.createElement("td");
    td.innerHTML = conferences_list_columns_value[a];
    if (is_sort_target) {
      td.innerHTML += ` ∨`;
      td.style.color = "blue";
    }
    if (conferences_list_columns_key[a] == "name" || conferences_list_columns_key[a] == "venue") {
      td.addEventListener("click", (e)=>conferences_list_display_all(sort="deadline"));
    } else {
      td.addEventListener("click", (e)=>conferences_list_display_all(sort=conferences_list_columns_key[a]));
    }
    td.style.cursor = "pointer";
    tr.appendChild(td);
  }
  tbody.appendChild(tr);
  for (let a = 0; a < list_sorted.length; a++) {
    const tr = document.createElement("tr");
    if (typeof(list_sorted[a]['closed']) !== 'undefined') {
      tr.style.opacity = 0.7;
      tr.style.backgroundColor = "rgba(0.5 0.5 1.0 / 0.3)";
    }
    for (let b = 0; b < conferences_list_columns_key.length; b++) {
      const td = document.createElement("td");
      if (typeof(list_sorted[a][conferences_list_columns_key[b]]) !== 'undefined') {
        const record = list_sorted[a][conferences_list_columns_key[b]];
        const record_keys = Object.keys(record);
        for (let c = 0; c < record_keys.length; c++) {
          if (record_keys[c] == 'date') {
            const record_date = record['date'];
            if (typeof(record_date['year']) !== 'undefined') {
              td.innerHTML += (record_date['year'] > 0)? `${record_date['year']}` : "";
            }
            if (typeof(record_date['month']) !== 'undefined') {
              td.innerHTML += (record_date['month'] > 0)? `/${record_date['month']}` : "";
            }
            if (typeof(record_date['day']) !== 'undefined') {
              td.innerHTML += (record_date['day'] > 0)? `/${record_date['day']}` : "";
            }
          } else if (record_keys[c] == 'text') {
            td.innerHTML += `${record['text']}`;
          } else if (record_keys[c] == 'url') {
            td.style.cursor = "pointer";
            td.style.color = "blue";
            td.addEventListener("click", function () {window.open(record['url'])});
          }
        }
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  dom.appendChild(table);
}

function conferences_list_display_all(sort="deadline") {
  let is_valid_key = false;
  for (let a = 0; a < conferences_list_columns_key.length; a++) {
    if (conferences_list_columns_key[a] == sort) {
      is_valid_key = true;
    }
  }
  if (!is_valid_key) {
    sort = "deadline";
  }
  const conferences_list_international_dom = document.querySelector("#conferences-list-international");
  if (!conferences_list_international_dom) {
    return true;
  }
  conferences_list_display(conferences_list_international_dom, conferences_list_international, sort);
  const conferences_list_domestic_dom = document.querySelector("#conferences-list-domestic");
  if (!conferences_list_domestic_dom) {
    return true;
  }
  conferences_list_display(conferences_list_domestic_dom, conferences_list_domestic, sort);
}

window.addEventListener("load", function () {
  let list;
  if (typeof(conferences_list) !== 'undefined') {
    list = conferences_list;
  }
  let conferences_list_figure_dom = document.querySelector("figure#conferences-list");
  if (conferences_list_figure_dom) {
    list += conferences_list_load_from_table(conferences_list_figure_dom);
  }
  for (let a = 0; a < list.length; a++) {
    if (list[a]['type'] == "international") {
      conferences_list_international.push(list[a]);
    } else {
      conferences_list_domestic.push(list[a]);
    }
  }
  conferences_list_display_all();
  return false;
});
