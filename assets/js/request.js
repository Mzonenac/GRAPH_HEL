function apiRequest() {
 var Http = new XMLHttpRequest();
 var url='/graph/api';
 Http.open("GET", url);
 Http.send();
}
