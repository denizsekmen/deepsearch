import axios from 'axios';

class CrosshairAIService {
  constructor() {
    this.apiKey = null;
  }

  async fetchApiKey() {
    try {
      const request = await axios.get(
        "https://erbgarage.com/aivideosummarizer.php?query=aivideosummarizerwithardacmen"
      );
      const openaiToken = request.data.openaiApiKey;

      if (openaiToken) {
        this.apiKey = openaiToken;
        return openaiToken;
      }

      throw new Error("Failed to fetch OpenAI API key");
    } catch (error) {
      console.error("Error fetching API key:", error);
      throw new Error("Unable to connect to API service");
    }
  }

  async getCrosshairRecommendation(playStyle, game = 'cs2', language = 'tr') {
    if (!this.apiKey) {
      try {
        await this.fetchApiKey();
      } catch (error) {
        throw new Error("Failed to initialize AI service");
      }
    }

    try {
      // Dil bazlı sistem prompt'u
      const languageInstruction = language === 'tr' 
        ? 'Lütfen TÜRKÇE cevap ver.' 
        : language === 'en' 
        ? 'Please respond in ENGLISH.'
        : 'Please respond in the user\'s language.';

      const systemPrompt = game === 'cs2' 
        ? `You are a CS2 crosshair expert. ${languageInstruction}
           
           IMPORTANT: Only provide a crosshair code if the user is asking for crosshair recommendations or describing their play style.
           If they're just saying hello or asking general questions, respond conversationally without providing a code.
           
           When providing a crosshair recommendation, respond with a JSON object:
           {
             "description": "Brief explanation of why this crosshair suits their play style (in the user's language)",
             "code": "CS2 crosshair commands separated by '; ' (semicolon + space)",
             "hasCode": true
           }
           
           For general conversation (greetings, questions, etc.), respond with:
           {
             "description": "Your conversational response (in the user's language)",
             "code": null,
             "hasCode": false
           }
           
           CS2 CODE FORMAT RULES (CRITICAL - FOLLOW EXACTLY):
           - Always start with: cl_crosshairstyle [style]
           - Style codes: 0=dot, 2=dynamic, 4=static
           - Command order: cl_crosshairstyle, cl_crosshaircolor, cl_crosshairalpha, cl_crosshairusealpha, cl_crosshairdot, cl_crosshairsize, cl_crosshairthickness, cl_crosshairgap, cl_fixedcrosshairgap, cl_crosshair_drawoutline, cl_crosshair_outlinethickness, cl_crosshair_t, cl_crosshair_follow_recoil, cl_crosshairgap_useweaponvalue
           - If style is dynamic (2), add: cl_crosshair_dynamic_splitdist, cl_crosshair_dynamic_splitalpha_innermod, cl_crosshair_dynamic_splitalpha_outermod, cl_crosshair_dynamic_maxdist_splitratio
           - If style is NOT dynamic, DO NOT include dynamic parameters
           - Use cl_crosshair_follow_recoil (NOT cl_crosshair_recoil)
           - cl_crosshairgap MUST be negative (e.g., -5)
           - Color codes: 1=Green, 2=Yellow, 3=Blue, 4=Cyan, 5=Red
           - Always include: cl_crosshairalpha 255, cl_crosshairusealpha 1, cl_crosshair_t 0, cl_crosshair_follow_recoil 0, cl_crosshairgap_useweaponvalue 0
           
           Example static: cl_crosshairstyle 4; cl_crosshaircolor 1; cl_crosshairalpha 255; cl_crosshairusealpha 1; cl_crosshairdot 0; cl_crosshairsize 10; cl_crosshairthickness 2; cl_crosshairgap -5; cl_fixedcrosshairgap -5; cl_crosshair_drawoutline 1; cl_crosshair_outlinethickness 1; cl_crosshair_t 0; cl_crosshair_follow_recoil 0; cl_crosshairgap_useweaponvalue 0
           
           Example dynamic: cl_crosshairstyle 2; cl_crosshaircolor 5; cl_crosshairalpha 255; cl_crosshairusealpha 1; cl_crosshairdot 0; cl_crosshairsize 8; cl_crosshairthickness 1.5; cl_crosshairgap -3; cl_fixedcrosshairgap -3; cl_crosshair_drawoutline 1; cl_crosshair_outlinethickness 1; cl_crosshair_t 0; cl_crosshair_follow_recoil 0; cl_crosshairgap_useweaponvalue 0; cl_crosshair_dynamic_splitdist 7; cl_crosshair_dynamic_splitalpha_innermod 1; cl_crosshair_dynamic_splitalpha_outermod 0.5; cl_crosshair_dynamic_maxdist_splitratio 0.3
           
           Consider their play style and recommend appropriate gap, size, thickness, and outline settings.`
        : `You are a Valorant crosshair expert. ${languageInstruction}
           
           IMPORTANT: Only provide a crosshair code if the user is asking for crosshair recommendations or describing their play style.
           If they're just saying hello or asking general questions, respond conversationally without providing a code.
           
           When providing a crosshair recommendation, respond with a JSON object:
           {
             "description": "Brief explanation of why this crosshair suits their play style (in the user's language)",
             "code": "Valorant crosshair code in format: 0;P;c;[preset];h;[outline];d;[centerDot];m;[globalMovementError];f;[globalFiringError];0e;[innerEnabled];0l;[length];0t;[thickness];0o;[opacity];0v;[vertical];0a;[movementError];0s;[firingError];0g;[movementMultiplier];0f;[firingMultiplier];0m;[fadeMovement];0b;[fadeFiring];1e;[outerEnabled];1l;[length];1t;[thickness];1o;[opacity];1v;[vertical];1a;[movementError];1s;[firingError];1g;[movementMultiplier];1f;[firingMultiplier];1m;[fadeMovement];1b;[fadeFiring]",
             "hasCode": true
           }
           
           For general conversation, respond with:
           {
             "description": "Your conversational response (in the user's language)",
             "code": null,
             "hasCode": false
           }
           
           VALORANT CODE FORMAT RULES (CRITICAL - FOLLOW EXACTLY):
           - Always start with: 0;P;c;[preset]
           - Preset colors: 1=Green, 2=Yellow, 3=Blue, 4=Cyan, 5=Red, 6=Pink, 7=White, 8=Custom (if 8, add u;[HEX] after c;8)
           - Key order: 0;P;c;[preset];h;[outline 0/1];d;[centerDot 0/1];m;[globalMovementError 0/1];f;[globalFiringError 0/1]
           - Inner lines (prefix 0): 0e;[enabled 0/1];0l;[length];0t;[thickness];0o;[opacity 0-1];0v;[vertical 0/1];0a;[movementError 0/1];0s;[firingError 0/1];0g;[movementMultiplier];0f;[firingMultiplier];0m;[fadeMovement 0/1];0b;[fadeFiring 0/1]
           - Outer lines (prefix 1): 1e;[enabled 0/1];1l;[length];1t;[thickness];1o;[opacity 0-1];1v;[vertical 0/1];1a;[movementError 0/1];1s;[firingError 0/1];1g;[movementMultiplier];1f;[firingMultiplier];1m;[fadeMovement 0/1];1b;[fadeFiring 0/1]
           - All values separated by semicolon (;), no spaces except in HEX
           - Include all parameters even if default (0 or 1)
           
           Example: 0;P;c;1;h;1;d;0;m;0;f;0;0e;1;0l;6;0t;2;0o;1;0v;1;0a;0;0s;0;0g;0;0f;0;0m;0;0b;0;1e;0;1l;2;1t;2;1o;1;1v;1;1a;0;1s;0;1g;0;1f;0;1m;0;1b;0
           
           Consider their play style and recommend appropriate settings for inner lines, outer lines, center dot, and error multipliers.`;

      // Direct axios call to OpenAI API (React Native uyumlu)
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: systemPrompt
            },
            { 
              role: 'user', 
              content: playStyle
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const aiResponse = JSON.parse(response.data.choices[0].message.content);
      
      return {
        success: true,
        description: aiResponse.description,
        code: aiResponse.code,
        hasCode: aiResponse.hasCode !== false,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Fallback to mock response
      return this.getMockResponse(playStyle, game, language);
    }
  }

  getMockResponse(playStyle, game, language = 'tr') {
    const input = playStyle.toLowerCase();
    
    // Genel konuşma tespiti (dil bağımsız)
    const isGreeting = /^(merhaba|selam|hello|hi|hey|naber|nasılsın|how are you|good morning|good evening)/i.test(input.trim());
    const isShortQuestion = input.length < 30 && !input.includes('crosshair') && !input.includes('nişan') && !input.includes('oyun') && !input.includes('play');
    
    if (isGreeting || isShortQuestion) {
      // Sadece konuşma, kod yok - UYGULAMA DİLİNE GÖRE
      const greetingResponse = language === 'tr'
        ? 'Merhaba! Ben senin crosshair danışmanınım. Oyun tarzını anlatırsan sana özel bir crosshair önerebilirim. Mesela "agresif oynuyorum" veya "sakin bir oyuncuyum" gibi.'
        : 'Hello! I\'m your crosshair advisor. Describe your play style and I can recommend a custom crosshair. For example, "I play aggressively" or "I\'m a calm player".';
      
      return {
        success: true,
        description: greetingResponse,
        code: null,
        hasCode: false,
      };
    }
    
    // Crosshair önerisi isteniyor - UYGULAMA DİLİNE GÖRE
    let code = '';
    let description = '';

    if (game === 'cs2') {
      if (input.includes('agresif') || input.includes('aggressive') || input.includes('hızlı') || input.includes('fast')) {
        code = 'cl_crosshairstyle 2; cl_crosshaircolor 5; cl_crosshairalpha 255; cl_crosshairusealpha 1; cl_crosshairdot 0; cl_crosshairsize 2; cl_crosshairthickness 1; cl_crosshairgap -2; cl_fixedcrosshairgap -2; cl_crosshair_drawoutline 1; cl_crosshair_outlinethickness 1; cl_crosshair_t 0; cl_crosshair_follow_recoil 0; cl_crosshairgap_useweaponvalue 0; cl_crosshair_dynamic_splitdist 5; cl_crosshair_dynamic_splitalpha_innermod 1; cl_crosshair_dynamic_splitalpha_outermod 0.5; cl_crosshair_dynamic_maxdist_splitratio 0.3';
        description = language === 'tr'
          ? 'Agresif oyun tarzınız için dinamik, küçük gap\'li ve kırmızı renkli bir crosshair öneriyorum. Bu, hızlı hareket ve reaksiyon gerektiren durumlarda size yardımcı olacaktır.'
          : 'For your aggressive play style, I recommend a dynamic crosshair with small gap and red color. This will help you in fast-paced situations requiring quick reactions.';
      } else if (input.includes('sakin') || input.includes('calm') || input.includes('defensive')) {
        code = 'cl_crosshairstyle 4; cl_crosshaircolor 1; cl_crosshairalpha 255; cl_crosshairusealpha 1; cl_crosshairdot 0; cl_crosshairsize 3; cl_crosshairthickness 1; cl_crosshairgap -5; cl_fixedcrosshairgap -5; cl_crosshair_drawoutline 1; cl_crosshair_outlinethickness 1; cl_crosshair_t 0; cl_crosshair_follow_recoil 0; cl_crosshairgap_useweaponvalue 0';
        description = language === 'tr'
          ? 'Sakin oyun tarzınız için statik, geniş gap\'li ve yeşil renkli bir crosshair öneriyorum. Bu, hassas nişan almayı kolaylaştıracak ve dikkatinizi dağıtmayacaktır.'
          : 'For your calm play style, I recommend a static crosshair with wide gap and green color. This will facilitate precise aiming and won\'t distract you.';
      } else if (input.includes('dengeli') || input.includes('balanced')) {
        code = 'cl_crosshairstyle 4; cl_crosshaircolor 2; cl_crosshairalpha 255; cl_crosshairusealpha 1; cl_crosshairdot 0; cl_crosshairsize 2; cl_crosshairthickness 1.5; cl_crosshairgap -3; cl_fixedcrosshairgap -3; cl_crosshair_drawoutline 1; cl_crosshair_outlinethickness 1; cl_crosshair_t 0; cl_crosshair_follow_recoil 0; cl_crosshairgap_useweaponvalue 0';
        description = language === 'tr'
          ? 'Dengeli oyun tarzınız için orta kalınlıkta, sarı renkli klasik bir crosshair öneriyorum. Bu, her durumda iyi performans sağlayacaktır.'
          : 'For your balanced play style, I recommend a medium-thickness classic crosshair in yellow. This will perform well in all situations.';
      } else if (input.includes('pro') || input.includes('profesyonel')) {
        code = 'cl_crosshairstyle 4; cl_crosshaircolor 4; cl_crosshairalpha 255; cl_crosshairusealpha 1; cl_crosshairdot 0; cl_crosshairsize 1; cl_crosshairthickness 1; cl_crosshairgap -4; cl_fixedcrosshairgap -4; cl_crosshair_drawoutline 0; cl_crosshair_outlinethickness 1; cl_crosshair_t 0; cl_crosshair_follow_recoil 0; cl_crosshairgap_useweaponvalue 0';
        description = language === 'tr'
          ? 'Profesyonel oyun için minimal, ince çizgili ve cyan renkli bir crosshair öneriyorum. Bu, profesyonel oyuncuların tercih ettiği temiz ve dikkat dağıtmayan bir tasarımdır.'
          : 'For professional play, I recommend a minimal, thin-lined cyan crosshair. This is the clean, non-distracting design preferred by pro players.';
      } else {
        code = 'cl_crosshairstyle 4; cl_crosshaircolor 1; cl_crosshairalpha 255; cl_crosshairusealpha 1; cl_crosshairdot 0; cl_crosshairsize 2; cl_crosshairthickness 1.5; cl_crosshairgap -3; cl_fixedcrosshairgap -3; cl_crosshair_drawoutline 1; cl_crosshair_outlinethickness 1; cl_crosshair_t 0; cl_crosshair_follow_recoil 0; cl_crosshairgap_useweaponvalue 0';
        description = language === 'tr'
          ? 'Genel kullanım için dengeli bir crosshair öneriyorum. Bu tasarım çoğu oyun tarzına uygun ve görünürlüğü yüksektir.'
          : 'For general use, I recommend a balanced crosshair. This design suits most play styles and has high visibility.';
      }
    } else {
      // Valorant mock - UYGULAMA DİLİNE GÖRE (Canonical format)
      if (input.includes('agresif') || input.includes('aggressive') || input.includes('hızlı') || input.includes('fast')) {
        code = '0;P;c;5;h;1;d;0;m;0;f;0;0e;1;0l;8;0t;2;0o;1;0v;1;0a;1;0s;1;0g;1;0f;1;0m;0;0b;0;1e;0;1l;2;1t;2;1o;1;1v;1;1a;0;1s;0;1g;0;1f;0;1m;0;1b;0';
        description = language === 'tr'
          ? 'Agresif oyun tarzınız için kırmızı, kompakt bir crosshair. İnce çizgiler ve küçük gap hızlı hedefe kilitlenme sağlar.'
          : 'For aggressive play style, red compact crosshair. Thin lines and small gap provide quick target acquisition.';
      } else if (input.includes('sakin') || input.includes('calm') || input.includes('defensive')) {
        code = '0;P;c;1;h;1;d;1;m;0;f;0;0e;1;0l;10;0t;1;0o;1;0v;1;0a;0;0s;0;0g;0;0f;0;0m;0;0b;0;1e;1;1l;4;1t;2;1o;0.35;1v;1;1a;0;1s;0;1g;0;1f;0;1m;0;1b;0';
        description = language === 'tr'
          ? 'Sakin oyun için yeşil, geniş gap\'li crosshair. Center dot ve outer lines hassas nişan almanızı kolaylaştırır.'
          : 'For calm play, green crosshair with wide gap. Center dot and outer lines help precise aiming.';
      } else if (input.includes('dengeli') || input.includes('balanced')) {
        code = '0;P;c;2;h;1;d;0;m;0;f;0;0e;1;0l;6;0t;2;0o;1;0v;1;0a;1;0s;0;0g;0.8;0f;0;0m;0;0b;0;1e;1;1l;2;1t;2;1o;0.35;1v;1;1a;0;1s;0;1g;0;1f;0;1m;0;1b;0';
        description = language === 'tr'
          ? 'Dengeli oyun için sarı, orta boyutlu crosshair. İyi görünürlük ve her durumda kullanışlılık.'
          : 'For balanced play, yellow medium-sized crosshair. Good visibility and versatile.';
      } else if (input.includes('pro') || input.includes('profesyonel')) {
        code = '0;P;c;4;h;0;d;0;m;0;f;0;0e;1;0l;4;0t;1;0o;1;0v;1;0a;0;0s;0;0g;0;0f;0;0m;0;0b;0;1e;0;1l;2;1t;2;1o;1;1v;1;1a;0;1s;0;1g;0;1f;0;1m;0;1b;0';
        description = language === 'tr'
          ? 'Pro oyuncular için cyan, minimal crosshair. Temiz ve dikkat dağıtmayan, sadece gerekli çizgiler.'
          : 'For pro players, cyan minimal crosshair. Clean and non-distracting, only essential lines.';
      } else {
        code = '0;P;c;1;h;1;d;0;m;0;f;0;0e;1;0l;6;0t;2;0o;1;0v;1;0a;1;0s;0;0g;0;0f;0;0m;0;0b;0;1e;0;1l;2;1t;2;1o;1;1v;1;1a;0;1s;0;1g;0;1f;0;1m;0;1b;0';
        description = language === 'tr'
          ? 'Genel kullanım için yeşil, dengeli crosshair. İyi görünürlük ve kullanışlılık.'
          : 'For general use, green balanced crosshair. Good visibility and usability.';
      }
    }

    return {
      success: true,
      description,
      code,
      hasCode: true,
    };
  }
}

export default new CrosshairAIService();

