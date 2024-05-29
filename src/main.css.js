export default `.animbuilder-canvas-container {
	background-color: rgba(255, 255, 255, 0.03);
	position: relative;
	display: inline-block;
	width: 300px;
	height: 100%;
	box-shadow: inset 0 0 8px 3px;
}
.input-group {
	display: grid;
	grid-auto-flow: dense;
}
.animbuilder-sets-container {
	display: inline-block;
	vertical-align: top;
	margin-left: 5px;
	cursor: pointer;
	width: 48%;
	height: 53vh;
}
#aimware-window {
	background-color: rgb(17, 19, 20);
}
#aimware-window label {
	color: rgb(230, 230, 230);
	font-size: 16px;
}
#aimware-window input {
	background-color: transparent;
	border: 2px solid #222324;
	margin-left: 10px;
	border-radius: 3px;
	color: rgb(230, 230, 230);
}
#aimware-window input[type="text"] {
	margin: 0 auto;
    width: 90%;
}
.aimware-dropdown > option {
	background-color: rgb(24, 26, 28);
	border: 2px solid #222324;
	border-radius: 3px;
}
.aimware-dropdown {
	background-color: transparent;
	border: 2px solid #222324;
	border-radius: 3px;
	margin-left: 10px;
	color: rgb(230, 230, 230);
	width: 93%;
	margin-top: 1px;
}
.aimware-keyinput {
	height: 18px;
	width: 50px;
	background: transparent;
	border: 1px solid #222324;
	border-radius: 3px;
	margin-left: 10px;
	color: white;
	text-align: center;
}
input.aimware-range[type="range"] {
	-webkit-appearance: none;
	appearance: none;
	background: transparent;
	cursor: pointer;
	width: 215px;
	margin-left: 10px;
}
input.aimware-range[type="range"]:focus {
	outline: none;
}
input.aimware-range[type="range"]::-webkit-slider-runnable-track {
	background-color: #383839;
	border-radius: 3px;
	height: 5px;
}
input.aimware-range[type="range"]::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	margin-top: -5.5px;
	background-color: #5666f2;
	border-radius: 15px;
	height: 16px;
	width: 16px;
}
input.aimware-range[type="range"]::-moz-range-track {
	background-color: #383839;
	border-radius: 3px;
	height: 5px;
}
input.aimware-range[type="range"]::-moz-range-thumb {
	background-color: #5666f2;
	border: none;
	border-radius: 15px;
	height: 16px;
	width: 16px;
}
input.aimware-range2[type="range"] {
	-webkit-appearance: none;
	appearance: none;
	background: transparent;
	cursor: pointer;
	width: 190px;
	margin-left: 10px;
}
input.aimware-range2[type="range"]:focus {
	outline: none;
}
input.aimware-range2[type="range"]::-webkit-slider-runnable-track {
	background-color: #383839;
	border-radius: 3px;
	height: 5px;
}
input.aimware-range2[type="range"]::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	margin-top: -5.5px;
	background-color: #5666f2;
	border-radius: 15px;
	height: 16px;
	width: 16px;
}
input.aimware-range2[type="range"]::-moz-range-track {
	background-color: #383839;
	border-radius: 3px;
	height: 5px;
}
input.aimware-range2[type="range"]::-moz-range-thumb {
	background-color: #5666f2;
	border: none;
	border-radius: 15px;
	height: 16px;
	width: 16px;
}
.aimware-rangetext {
	/* -moz-appearance: textfield; */
	background-color: transparent;
	border: 2px solid #222324;
	margin-left: 10px;
	border-radius: 3px;
	color: rgb(230, 230, 230);
	width: 35px;
    text-align: center;
}
/*
.aimware-rangetext::-webkit-inner-spin-button,
.aimware-rangetext::-webkit-outer-spin-button {
  	-webkit-appearance: none;
  	margin: 0;
}
*/
.aimware-cbtext {
	position: absolute;
	margin-top: 4px;
	margin-left: 6px;
	color: rgb(230, 230, 230);
	font-size: 13px;
}
hr.aimware-hr {
	border: solid 1px rgb(74, 86, 198);
	box-shadow: rgb(74, 86, 198) 0px 0px 11px 2px;
	margin-bottom: 5px;
	margin-top: 3px;
}
.aimware-section > label:first-child {
	color: rgb(230, 230, 230);
}
div.aimware-section {
	border-radius: 5px;
	height: 530px;
	background-color: rgb(22, 24, 26);
	margin: 10px 5px 0px 5px;
	padding: 5px;
	flex: 1;
}
.aimware-tab {
	display: flex;
	overflow-y: auto;
}
#aimware-tablist {
	text-align: right;
	margin-top: -40px;
}
::-webkit-scrollbar-thumb {
    background-color: rgb(65, 65, 65);
}
::-webkit-scrollbar-button {
   	display: none;
}
::-webkit-scrollbar {
    width: 6px;
    height: 1px;
}
html, body {
	background-color: rgb(11, 11, 11);
}
.aimware-tab-button {
	border: none;
	background: transparent;
	width: 95px;
	height: 40px;
	color: rgb(150, 150, 150);
	font-size: 11.5px;
	padding: 0;
	margin: 0;
}
.aimware-tab-button:active, .aimware-tab-button-active:active {
	border: none;
	-o-border-image: none;
	   border-image: none;
	transition: -webkit-filter 0.125s;
	transition: filter 0.125s;
	transition: filter 0.125s, -webkit-filter 0.125s;
}
.aimware-tab-button-active {
	border: none;
	background: linear-gradient(0deg, rgb(74 88 200 / 55%) 0%, rgba(0, 0, 0, 0) 100%);
	border-bottom: solid 2px rgb(74 88 200);
	width: 95px;
	height: 40px;
	color: rgb(150, 150, 150);
	font-size: 11.5px;
	padding: 0;
	margin: 0;
}
.aimware-tab-button:hover {
	border: none;
	background: linear-gradient(0deg, rgb(54 68 180 / 55%) 0%, rgba(0, 0, 0, 0) 100%);
	border-bottom: solid 2px rgb(44 58 170);
	width: 95px;
	height: 40px;
	color: rgb(150, 150, 150);
	font-size: 11.5px;
	padding: 0;
	margin: 0;
}
.aimware-button {
	border: 2px solid #3e4043;
	border-radius: 3px;
	background-color: rgba(127, 127, 127, 0.1);
	width: 90%;
	height: 25px;
	color: rgb(150, 150, 150);
	font-size: 11.5px;
	
	margin: 0 auto; /* Center the button horizontally */
	display: block; /* Needed to use margin auto for centering */
}
.aimware-button-small {
	border: 2px solid #222324;
	border-radius: 3px;
	background: rgba(200, 200, 200, 0.01);
	width: 72%;
	height: 25px;
	color: rgb(150, 150, 150);
	font-size: 11.5px;
	margin-bottom: 1px;
	margin-top: 2px;
	margin-left: 10px;
}
.aimware-button-small-2 {
	border: 2px solid #222324;
	border-radius: 3px;
	background: rgba(200, 200, 200, 0.01);
	width: 40%;
	height: 25px;
	color: rgb(150, 150, 150);
	font-size: 11.5px;
	margin-bottom: 1px;
	margin-top: 2px;
	margin-left: 10px;
}
.aimware-topbar {
	border-bottom: solid 2px #4a58c8;
	background-color: rgb(13, 15, 17);
	height: 40px;
}
.control {
    display: block;
    position: relative;
    padding: 5px 0px 5px 25px;
    cursor: pointer;
    font-size: 16px;
    margin-left: 10px;
}
.control input {
	position: absolute;
	z-index: -1;
	opacity: 0;
}
.control_indicator {
	position: absolute;
	top: 2px;
	left: 0;
	height: 18px;
	width: 18px;
	background: transparent;
	border: 2px solid #3e4043;
	border-radius: 3px;
}
.control:hover input ~ .control_indicator,
.control input:focus ~ .control_indicator {
	background: rgba(255, 255, 255, 0.025);
}

.control input:checked ~ .control_indicator {
	background: #4a59c8;
}
.control:hover input:not([disabled]):checked ~ .control_indicator,
.control input:checked:focus ~ .control_indicator {
	background: #0e6647d;
}
.control input:disabled ~ .control_indicator {
	background: #333f9e;
	opacity: 1;
	pointer-events: none;
}
.control_indicator:after {
	box-sizing: unset;
	content: '';
	position: absolute;
	display: none;
}
.control input:checked ~ .control_indicator:after {
	display: block;
}
.control-checkbox .control_indicator:after {
	left: 7px;
	top: 3px;
	width: 3px;
	height: 8px;
	border: solid #111314;
	border-width: 0 2px 2px 0;
	transform: rotate(45deg);
}
.control-checkbox input:disabled ~ .control_indicator:after {
	border-color: #111314;
}
#aimware-window table {
	border-collapse: collapse;
	color: rgb(75, 88, 213);
	text-align: center;
	width: -webkit-fill-available;
	border: solid 1px rgb(55, 55, 55);
}
#aimware-window th, #aimware-window td {
	font-size: 12.5px;
	padding: 2px;
	border-color: rgb(200, 200, 200);
	border-width: 1px;
	border-style: double;
	border-right-style: none;
	border: solid 1px rgb(55, 55, 55);
}
#aimware-window th:last-child {
    width: 20px;
}
#aimware-window tr:first-child {
	text-align: center;
	border: solid 1px rgb(55, 55, 55);
}`