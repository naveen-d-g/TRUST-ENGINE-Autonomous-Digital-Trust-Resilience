with open(r'e:\project\frontend\src\pages\Evaluate.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''                                   </div>
                                </div>
                             </td>
                          </tr>'''

replacement = '''                                   </div>
                                   
                                   {/* Bot Detection Detailed View */}
                                   {user.bot_detected && (
                                       <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl space-y-2 relative overflow-hidden shadow-inner flex-shrink-0">
                                           <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mt-10 -mr-10" />
                                           <div className="flex items-center gap-2 text-danger font-black text-xs uppercase tracking-widest mb-3">
                                               <ShieldAlert className="w-4 h-4" /> Bot Detection Engine Triggered
                                           </div>
                                           <div className="text-[11px] font-mono text-red-200/80 whitespace-pre-wrap leading-relaxed pl-2 border-l border-red-500/30">
                                               {user.bot_reason || "Behavioral heuristics matched known bot trajectories."}
                                           </div>
                                           <div className="mt-4 inline-flex px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-widest rounded shadow-sm">
                                               Action Taken: Session Terminated | Password Reset Required (Manual)
                                           </div>
                                       </div>
                                   )}
                                </div>
                             </td>
                          </tr>'''

# Normalize newlines
target = target.replace('\r', '')
text = text.replace('\r', '')

if target in text:
    text = text.replace(target, replacement)
    with open(r'e:\project\frontend\src\pages\Evaluate.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Success")
else:
    print("Failed")
