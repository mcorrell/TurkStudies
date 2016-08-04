var data;

process();

function process(){
  //Steps:
  // 1. Load in csvs of both raw data, and turk completion information.
  // 2. Filter out rows from turkIDs who didn't complete the HIT.
  // 3. Filter out validation stim
  // 4. Ensure there is only one row per turkID x question index.
  // 5. Anonymize by replacing turkID with index in completion table.
  // 6. save that sucker for the repo.
  // 7. do analysis.
  var demoTable = dl.csv("./Exp1/exp1demo.csv");
  var dataTable = dl.csv("./Exp1/exp1.csv");
  
  var cleaned = [];
  var valids = [];
  var turkId;
  var row;
  
  for(var i = 0;i<demoTable.length;i++){
    row = demoTable[i];
    turkId = row.WorkerId;
    valids = dataTable.filter(function(x){ return x.id == turkId && !(x.isValidation);});
    valids = cleanRows(valids,i);
    if(valids.length>96){
      console.log(turkId + ":" + valids.length);
    }
    cleaned = cleaned.concat(valids);
  }
  
  data = cleaned;
}

function cleanRows(rows,index){
  var cleanedRows = [];
  var seen = dl.repeat(false,100);
  for(let row of rows){
    row.id = index;
    if(!seen[row.index]){
      seen[row.index]=true;
      cleanedRows.push(row);
    }
  }
  return cleanedRows;
}

function analysis(){
  
}

