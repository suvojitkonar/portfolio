import { TOTAL_SCREENS } from "./CommonUtilities";
import { Subject } from "rxjs";
import { object } from "prop-types";

export default class ScrollService {
    static scrollHandler = new ScrollService();

    static currentScreenBroadCaster = new Subject();
    static currentScreenFadeIn = new Subject();

    constructor() {
        window.addEventListener('scroll', this.checkCurrentScreenUnderViewport);
    }

    scrollToHireMe = () => {
        let ccontactMeScreen = document.getElementById("Contact Me")
        if (!ccontactMeScreen) return;
        ccontactMeScreen.scrollIntoView({ behavior: "smooth" })
    }

    scrollToHome = () => {
        let homeScreen = document.getElementById("Home")
        if (!homeScreen) return;
        homeScreen.scrollIntoView({ behavior: "smooth" });
    }

    isElementInView = (elem, type) => {
        let rec = elem.getBoundingClientRect();
        let elemTop = rec.top;
        let elemBot = rec.bottom;

        let partiallyVisible = elemTop < window.innerHeight && elemBot >= 0;
        let completelyVisible = elemTop >= 0 && elemBot <= window.innerHeight;

        switch (type) {
            case "partial":
                return partiallyVisible;

            case "complete":
                return completelyVisible

            default:
                return false
        }
    }

    checkCurrentScreenUnderViewport = (event) => {
        if (!event || object.keys(event).length < 1)
            return;
        for (let screen of TOTAL_SCREENS) {
            let screenFromDOM = document.getElementById(screen.screen_name);
            if (!screenFromDOM)
                continue;

            let fullVisible = this.isElementInView(screenFromDOM, "complete");
            let partiallyVisible = this.isElementInView(screenFromDOM, "partial");

            if (fullVisible || partiallyVisible) {
                if (partiallyVisible && !screen.alreadyRendered) {
                    ScrollService.currentScreenFadeIn.next({
                        fadeInScreen: screen.screen_name
                    });
                    screen['alreadyRendered'] = true;
                    break;
                }
                if (fullVisible)
                    ScrollService.currentScreenFadeIn.next({
                        screenInView: screen.screen_name
                    });
                break;
            }
        }
    }
}

