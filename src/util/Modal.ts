
export interface ModalAction {
  text: string;
  callback: Function;
  primary: boolean;
}

export async function modal(
  title: string,
  message: string,
  actions?: ModalAction[]
) {
  if (!actions) {
    actions = [{
      text: 'OK',
      callback: () => { },
      primary: true,
    }];
  }
  const modalWrapperEl = document.createElement('div');
  modalWrapperEl.classList.add('modal__wrapper');

  const modalEl = document.createElement('div');
  modalEl.classList.add('modal__body');

  const headerEl = document.createElement('div');
  headerEl.classList.add('modal__header');
  headerEl.innerText = title;

  const contentsEl = document.createElement('div');
  contentsEl.classList.add('modal__contents');
  contentsEl.innerText = message;

  const actionsContainerEl = document.createElement('div');
  actionsContainerEl.classList.add('modal__actions');

  document.body.appendChild(modalWrapperEl);
  modalWrapperEl.appendChild(modalEl);
  modalEl.appendChild(headerEl);
  modalEl.appendChild(contentsEl);
  modalEl.appendChild(actionsContainerEl);
  actions.forEach(action => {
    const actionEl = document.createElement('button');
    actionEl.addEventListener('click', () => {
      action.callback();
      document.body.removeChild(modalWrapperEl);
    });
    actionEl.innerText = action.text;
    actionEl.classList.add('modal__button');
    if (action.primary) {
      actionEl.classList.add('modal__button-primary');
    }
    actionsContainerEl.appendChild(actionEl);
  });
}

export function chooseOption<U, T extends (U | { text: string; value: U; })>(
  title: string,
  message: string,
  options: T[]
): Promise<U> {
  return new Promise((resolve) => {
    const actions: ModalAction[] = options.map(option => {
      // @ts-ignore ts won't narrow the type from (T extends (string | {})). Until it's fixed, ignore it here
      const label = typeof option === 'string' ? option : option.text;
      // @ts-ignore ts won't narrow the type from (T extends (string | {})). Until it's fixed, ignore it here
      const resolveValue = typeof option === 'string' ? option : option.value;
      return {
        primary: false,
        text: label,
        callback: () => { resolve(resolveValue); },
      };
    });
    modal(title, message, actions);
  });
}
