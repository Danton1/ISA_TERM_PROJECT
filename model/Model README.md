
build_career_training_dataset.py - Used for cleaning the Kaggle LinkedIn job_skills.csv dataset and attaching prompts to build training data corresponding to Google's Gemma IT model.

train_model.py - used for fine-tuning the model based of a chosen csv.  Currently it selects 50000 samples from a given data set, but it will be refactored to consider the full data set in the final version.

merge adapter and base model.py - Merges the original Gemma model with the trainined model adapter to speed up performance of inference of the model. This allows one set of files to be uploaded and run locally or hosted.

How to call the model in javascript (note, no tokens should be required as this is set up on the model side):
const query = async () => {
  const response = await fetch("https://mickmcb-education-adivsor.hf.space/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: "What degree do I need to become a data scientist?"
    })
  });

  const data = await response.json();
  console.log(data.response);
};

query();

Note, not all files for the model are included in this folder.  Large files such as the current training weights and the original dataset exceed allowable size for github. Contact Michael McBride if you'd like to get these files.

Finalized instructions for performing creating a merged gemma plus LoRa adapter model files to upload to huggingface:
1. Download the job_skills.csv and put it in the model folder (source: https://www.kaggle.com/datasets/batuhanmutlu/job-skill-set?resource=download)
2. Run build_career_training_dataset.py to convert to csv to useable data
3. Run train_model.py to commence model training (approx. 10 hours) and get the adapter
4. Run merge adapter and base model.py to combine the base Gemma model with the adapter to make a self contained model
5. Upload the files to a HuggingFace respository and set up a HuggingFace spaces to access the model.