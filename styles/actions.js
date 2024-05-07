// CODE MODIFIED FROM FLORIN POP ON CODEPEN https://codepen.io/FlorinPop17/pen/vPKWjd

const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton?.addEventListener('click', () => {
	container?.classList.add("right-panel-active");
});

signInButton?.addEventListener('click', () => {
	container?.classList.remove("right-panel-active");
});