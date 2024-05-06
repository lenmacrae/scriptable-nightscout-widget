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
//const glucoseDisplay = `mmoll`;
const dateFormat  = `en-US`;

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
    
    header = list.addText("Nightscout".toUpperCase());
    header.font = Font.mediumSystemFont(10);
  
    let glucoseValue = nsDataV2.bg;		
	
	if(glucoseDisplay === `mmoll`){
		glucoseValue = Math.round(nsDataV2.bg / 18 * 100) / 100;
	}
	
	
    glucose = list.addText("" + glucoseValue + " " + directionString);
    glucose.font = Font.mediumSystemFont(34);
    
    iob = list.addText("" + nsDataV2.iob);
    iob.font = Font.mediumSystemFont(14);
    
    cob = list.addText("" +  nsDataV2.cob);
    cob.font = Font.mediumSystemFont(14);
    
    list.addSpacer();
    
    let updateTime = new Date(nsDataV2.mills).toLocaleTimeString(dateFormat, { hour: "numeric", minute: "numeric" })
    updated = list.addText("" + updateTime);
    updated.font = Font.mediumSystemFont(10);
    
    
    list.refreshAfterDate = new Date(Date.now() + 60);
    return list;
}

async function getNsDataV2() {
    let url = nsUrl + "/api/v2/properties?&token=" + nsToken;
    let data = await new Request(url).loadJSON();
	  return {
        bg: data.bgnow.mean,
		direction: data.bgnow.sgvs[0].direction,
		iob: data.iob.displayLine,
        cob: data.cob.displayLine,
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
