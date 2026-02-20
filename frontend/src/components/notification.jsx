




const Notification = ({title, text}) => {
  return (
    <>
        <div id="dialog" aria-labelledby="dialog-title" className="fixed top-4 right-4 w-100 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent">

          <div tabindex="0" className="flex min-h-full items-end p-4 text-center focus:outline-none sm:items-center sm:p-0">
            <el-dialog-panel className="relative transform overflow-hidden rounded-lg bg-zinc-800 text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95">
              <div className="bg-zinc-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" className="size-6 text-red-400">
                      <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 id="dialog-title" className="text-base font-semibold text-white">{title}</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">{text}</p>
                    </div>
                  </div>
                </div>
              </div>
            </el-dialog-panel>
          </div>
        </div>
    </>
  );
};


export default Notification;
