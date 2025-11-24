train_model.py - used for fine-tuning the model based of a chosen csv.  Currently it selects 50000 samples from a given data set, but it will be refactored to consider the full data set in the final version.

smoke.py - used for a basic test of referencing the base model to be fine tuned.

app.py - the python file for running the model through Gradio.  Our current model uses a Docker container on HuggingFace Spaces instead of Gradio in order to take advantage of FastAPI.

create_and_push.txt - contains the commands used in order to create the model weights files and push all necessary files to Hugging Face



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
3. Run build_large_arrow_dataset.py to create the parquet shards (clear career_parquet folder before running)
4. Run pretokenize_dataset.py to get the pretokenized shards for the training data
5. Run combine_shards.py to convert the pretokenized shards back to a full dataset (clear the career_tokenized_combined folder before this)
6. Run train_model.py to commence model training (approx. 10 hours) and get the adapter
7. Run merge adapter and base model.py to combine the base Gemma model with the adapter to make a self contained model
8. Upload the files in gemma-edu-2b-merged to HuggingFace