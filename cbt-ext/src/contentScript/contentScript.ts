import { oneTimeMsgFactory } from "xtension-messenger";
import { ExtensionMessageInterface } from "xtension-messenger/dist/types/interfaces";
import {
	FormDataInterface,
	GeneratorResultInterface,
	CsState,
} from "../interfaces";
import { actionButtonMethods } from "./actionBtnAndModal/actionBtn";

import { csDom } from "./csDOM";
import { formMethods } from "./formInsertMethods";
import { setState as stateManager } from "./setState";
import {
	messageType,
	notifyToast,
	cleanupAll,
	emitCustomEvent,
} from "../utils";
import { CustomEvents } from "./customEvents";

const csApp = {
	state: {
		latestFormData: null as FormDataInterface | null,
		phone: null as string | null,
		fileName: null as string | null,
		shouldCheckImageMatch: false,
		ui: {
			customMessage: "default message",
			shouldShowError: false,
			isDataAvailable: false,
			shouldShowActionBtn: false,
		},
	} as Partial<CsState>,

	stateAction: {
		updateUI(ui: Partial<CsState["ui"]>): void {
			csApp.setState({ ui });
		},

		onDataLoaded(
			data: FormDataInterface,
			uiOverride?: Partial<CsState["ui"]>
		): void {
			csApp.setState({
				latestFormData: data,
				ui: {
					isDataAvailable: true,
					shouldShowActionBtn: true,
					shouldShowError: false,
					customMessage: "New data loaded",
					...uiOverride,
				},
			});
		},

		handleGeneratorResult(
			result: GeneratorResultInterface<FormDataInterface>,
			eventName?: string
		): void {
			if (!result || result.done === true) {
				// csApp.stateAction.updateUI({
				// 	shouldShowError: true,
				// 	customMessage: "No data available",
				// });

				throw new Error("no data available");
			}

			csApp.stateAction.onDataLoaded(result.value);

			if (eventName) {
				emitCustomEvent({
					eventName,
					payload: result,
				});
			}
		},

		onFormInteraction(e: Event): void {
			const data = csApp.state.latestFormData;

			if (!data) {
				csApp.stateAction.updateUI({
					customMessage: "Start data fetching sequence",
					shouldShowError: true,
				});
				return;
			}

			formMethods.handleEvent(e, data);
		},
		checkImageImageMatch() {
			csApp.setState({ shouldCheckImageMatch: false });
			const phone = csApp.state.phone?.toLowerCase().trim();
			const fileName = csApp.state.fileName?.toLowerCase().trim();

			if (!phone || !fileName) {
				console.error("phone and filename missing");
				return;
			}

			if (phone !== fileName) {
				csApp.setState({
					ui: {
						customMessage: "file name and image is not a match",
						shouldShowError: true,
					},
				});
			}
		},
	},

	messaging: {
		cs: oneTimeMsgFactory("cs"),

		handleMessage(message: ExtensionMessageInterface): void {
			const result =
				message.payload as GeneratorResultInterface<FormDataInterface>;

			csApp.stateAction.handleGeneratorResult(result);
		},

		downloadImage(payload: { imageFile: string; phone: string }): void {
			csApp.messaging.cs.messageBackgroundScript({
				message: {
					type: messageType.startDownload,
					payload,
				},
				errorCb(error) {
					csApp.stateAction.updateUI({
						shouldShowError: true,
						customMessage: error.message as string,
					});
				},
				successCb(response) {
					csApp.stateAction.updateUI({
						shouldShowError: false,
						customMessage: response.message as string,
					});
				},
			});
		},

		getNextData(): void {
			csApp.messaging.cs.messageBackgroundScript({
				message: { type: messageType.getNextEnrol },
				errorCb(error) {
					csApp.stateAction.updateUI({
						customMessage: error.message as string,
						shouldShowError: true,
						isDataAvailable: false,
					});

					emitCustomEvent({
						eventName: CustomEvents.disableNextBtn,
					});
				},
				successCb(response) {
					const result =
						response.data as GeneratorResultInterface<FormDataInterface>;

					csApp.stateAction.handleGeneratorResult(
						result,
						CustomEvents.onRecieveNextEnrolData
					);
				},
			});
		},

		getPrevData(): void {
			csApp.messaging.cs.messageBackgroundScript({
				message: { type: messageType.getPrevEnrol },
				errorCb(error) {
					csApp.stateAction.updateUI({
						customMessage: error.message as string,
						shouldShowError: true,
						isDataAvailable: false,
					});

					emitCustomEvent({ eventName: CustomEvents.disablePrevBtn });
				},
				successCb(response) {
					const result =
						response.data as GeneratorResultInterface<FormDataInterface>;
					csApp.stateAction.handleGeneratorResult(
						result,
						CustomEvents.onRecievePrevEnrolData
					);
				},
			});
		},
		receivePhone(phone: string) {
			if (!phone) {
				csApp.setState({
					ui: {
						customMessage: "phone number not received",
						shouldShowError: true,
					},
				});
				return;
			}

			csApp.setState({ phone, shouldCheckImageMatch: !!csApp.state.fileName });
		},

		receiveImageFileName(imageFileName: string) {
			if (!imageFileName) {
				csApp.setState({
					ui: {
						customMessage: "imageFileName not received",
						shouldShowError: true,
					},
				});
				return;
			}
			if (csApp.state.phone) {
				csApp.setState({
					fileName: imageFileName,
					shouldCheckImageMatch: !!csApp.state.phone,
				});
			}
		},

		init(): void {
			csApp.messaging.cs.onMessageSync({
				onSyncCb: csApp.messaging.handleMessage,
			});
		},
	},

	render(): void {
		const ui = csApp.state.ui || {};
		const appState = csApp.state;

		notifyToast({
			type: ui.shouldShowError ? "error" : "success",
			text: ui.customMessage || "an error occured",
		});

		if (ui.shouldShowActionBtn) actionButtonMethods.initBtn();
		if (appState.shouldCheckImageMatch) {
			csApp.stateAction.checkImageImageMatch();
		}
	},

	setState(updatedState: Partial<CsState>): void {
		stateManager(csApp.state, updatedState, csApp.render);
	},

	initDOMEvents(): void {
		csDom.form?.addEventListener("dblclick", function (e) {
			csApp.stateAction.onFormInteraction(e);
		});

		document.addEventListener(CustomEvents.initDownload, function (e: Event) {
			const ev = e as CustomEvent<{ imageFile: string; phone: string }>;
			if (ev.detail) csApp.messaging.downloadImage(ev.detail);
		});

		document.addEventListener(CustomEvents.getNext, function () {
			csApp.messaging.getNextData();
		});

		document.addEventListener(CustomEvents.getPrev, function () {
			csApp.messaging.getPrevData();
		});

		document.addEventListener(
			CustomEvents.onPhoneNumberEmit,
			function (e: Event) {
				const ev = e as CustomEvent<{ phone: string }>;
				if (ev.detail) csApp.messaging.receivePhone(ev.detail.phone);
			}
		);

		document.addEventListener(
			CustomEvents.onImageFileNameEmit,
			function (e: Event) {
				const ev = e as CustomEvent<{ imageFileName: string }>;
				if (ev.detail)
					csApp.messaging.receiveImageFileName(ev.detail.imageFileName);
			}
		);
	},

	cleanup(): void {
		const elems = [csDom.actionBtn, csDom.nextBtn, csDom.actionModal];
		elems.forEach(function (elem) {
			document.getElementById(elem?.id as string)?.remove();
		});

		cleanupAll(".ext");
		cleanupAll(".ext-pill", function (pill) {
			const input = pill.previousElementSibling as
				| HTMLInputElement
				| HTMLSelectElement;
			if (input) input.value = "";
		});
	},

	init(): void {
		csApp.cleanup();
		csApp.messaging.init();
		csApp.initDOMEvents();
	},
};

csApp.init();

/**
 * get phone
 * get image file name,
 * verify that phone has the same extension as image
 * ask bg script if the hash is correct
 */

/**
 * whats the problem
 * i cant call them separately i need to call them together
 * after verifying for one what do i do ?
 * call a message sender to bg?
 * call a utility that does the checking ??
 * send the emits and add a new state e.g shouldCheckImageMatch that runs when the image and image file is present in the render
 * what do i want?
 * i need to get the phonenumber and image
 */
