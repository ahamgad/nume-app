import { getInstallGateBootstrapPaths } from "@/lib/navigation/runtime-routes";

/** Pre-paint redirect: browser + application route → landing. Runs before splash bootstrap. */
export function getInstallGateBootstrapScript(): string {
  const { distribution, transport, application } = getInstallGateBootstrapPaths();

  return `(function(){try{
var p=location.pathname;
if(p==="${distribution}")return;
var transport=${JSON.stringify(transport)};
if(transport.some(function(r){return p===r||p.indexOf(r+"/")===0;}))return;
var application=${JSON.stringify(application)};
var isApp=application.some(function(r){return p===r||p.indexOf(r+"/")===0;});
if(!isApp)return;
var supported=window.matchMedia("(display-mode: standalone)").matches
||window.matchMedia("(display-mode: fullscreen)").matches
||window.matchMedia("(display-mode: minimal-ui)").matches
||window.navigator.standalone===true;
if(supported)return;
location.replace("${distribution}");
}catch(e){}})();`;
}
