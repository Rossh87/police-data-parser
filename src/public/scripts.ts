const submitButton = document.querySelector('.submitButton');
const resultArea = document.querySelector('.results');
const form = document.querySelector('.field-form');
const fileInput = document.getElementById('csvInput') as HTMLInputElement;

const submitFormData = (fd: FormData) => fetch('/upload', {
	method: 'POST',
	body: fd
})

const appendResults = (json: string) => {
	const codeNode = document.createElement('div');
	const textNode = document.createTextNode(json);

	codeNode.appendChild(textNode);
	resultArea.appendChild(codeNode);
}

const handleFormSubmit = (e: Event) => {
	e.preventDefault();

	const fd = new FormData(e.target as HTMLFormElement);

	submitFormData(fd)
	.then(res => res.text())
	.then(appendResults)
	.catch(console.error)
}