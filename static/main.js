import * as start from "./registerPage.js"
import * as session from "./session.js"
import * as home from "./home.js"

async function init() {
	document.body.innerHTML = "<h1>Loading...</h1>";
	let user = await session.getUserFromSession()
	if (!user) {
		start.createIndexButton()
		start.indexListener()
	} else {
		home.homePage()
	}
}

init()