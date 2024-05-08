// Nightscout Widget
//
// Copyright (C) 2020 by niepi <niepi@niepi.org>
//
// Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER
// IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
// OF THIS SOFTWARE.

const nsUrl =`https://your-nightscout-url`; // your nightscout url
const nsToken =`your-nightscout-token`; // your nightscoutaccess token
const glucoseDisplay = `mgdl`;
//const glucoseDisplay = 'mgdl' or `mmoll`;
const dateFormat  = `en-US`;// 
// define out of range values
const lowvalue = 4;
const highvalue = 8;

// Initialize Widget
let widget = await createWidget();
if (!config.runsInWidget) {
    await widget.presentSmall();
}

Script.setWidget(widget);
Script.complete();

// Build Widget
async function createWidget(items) {
    const list = new ListWidget();
    
let header, glucose, iob, cob, updated;
let nsDataV2 = await getNsDataV2();
   
// create direction arrow
let directionString = await getDirectionString(nsDataV2.direction);
    
header = list.addText("Nightscout");
header.font = Font.mediumSystemFont(12);

let updateTime = new Date(nsDataV2.mills).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    updated = list.addText("" + updateTime);
    updated.font = Font.mediumSystemFont(12);
// color time older than 5 minutes to show missed readings(s)
   if((Date.now()- nsDataV2.mills) > 400000){
      updated.textColor = Color.red();
   }
    
list.addSpacer();
  
let glucoseValue = nsDataV2.mgdl;	
   if(glucoseDisplay === `mmoll`){
		glucoseValue = nsDataV2.mmoll;
    }
	
	
glucose = list.addText("" + glucoseValue + " " + directionString);
glucose.font = Font.mediumSystemFont(46);

// set color depending on glucose defaulting to in range
   glucose.textColor = Color.green();

    if(glucoseValue < lowvalue || glucoseValue > highvalue){
        glucose.textColor = Color.red();
    }
    
   list.addSpacer();
    
let deltaValue = nsDataV2.deltamgdl;
   if(glucoseDisplay === 'mmoll'){
      deltaValue = nsDataV2.deltammoll;
   }
 
   if(deltaValue>0) {deltaValue = ("+ " + deltaValue);    
   }
   delta = list.addText("" + deltaValue);
   delta.font = Font.mediumSystemFont(24);
    
    
    list.refreshAfterDate = new Date(Date.now() + 60);
    return list;
}

async function getNsDataV2() {
    let url = nsUrl + "/api/v2/properties?&token=" + nsToken;
    let data = await new Request(url).loadJSON();
	  return {
	mgdl: data.bgnow.mean,
	mmoll: data.bgnow.sgvs[0].scaled,
	direction: data.bgnow.sgvs[0].direction,
	deltamgdl: data.delta.mgdl,
	deltammoll: data.delta.scaled,
	mills: data.bgnow.mills
    };
}


async function getDirectionString(direction) {
    
    let directionString
    switch(direction) {
        case 'NONE':
        directionString = '⇼';
        break;
        case 'DoubleUp':
        directionString = '⇈';
        break;
        case 'SingleUp':
        directionString = '↑';
        break;          
        case 'FortyFiveUp':
        directionString = '↗';
        break;                  
        case 'Flat':
        directionString = '→';
        break;                      
        case 'FortyFiveDown':
        directionString = '↘';
        break;
        case 'SingleDown':
        directionString = '↓';
        break;  
        case 'DoubleDown':
        directionString = '⇊';
        break;
        case 'NOT COMPUTABLE':
        directionString = '-';
        break;  
        case 'RATE OUT OF RANGE':
        directionString = '⇕';
        break;
        default:
        directionString = '⇼';
    }
    return directionString;
}
