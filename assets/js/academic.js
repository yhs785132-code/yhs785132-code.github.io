document.getElementById('export-profile').addEventListener('click',()=>{
 const content=['M. Example','Fictional academic profile. All details below are examples.','','Research interests','Analog and mixed-signal integrated circuits, sensor interfaces, data converters.','','Project notes','Sensor readout circuits; SAR data converters; analog layout.','','Education','20XX–20XX: Example University, graduate study in Microelectronics.','20XX–20XX: Example University, B.Eng. in Electronic Engineering.','','Publications','No publications listed.'].join('\n');
 const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='example-cv.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 const status=document.getElementById('profile-toast');status.hidden=false;setTimeout(()=>status.hidden=true,3000);
});
